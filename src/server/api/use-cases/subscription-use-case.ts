import { TRPCError } from '@trpc/server'
import type Stripe from 'stripe'
import {
  subscriptionAccess,
  type SubscriptionEventAccess,
  type SubscriptionEventUser,
  type UpdateSubscriptionData
} from '~/server/api/data-access/subscription-access'
import { DuplicateStripeEventError } from '~/server/api/data-access/subscription-errors'
import { PRICE_ID_TO_TIER, TIER_TO_PRICE_ID } from '~/lib/stripe-config'
import { type CreateCheckoutSchema } from '~/schemas/subscription-schema'

export async function createCheckoutSession(
  userId: string,
  input: CreateCheckoutSchema,
  stripe: Stripe
) {
  const info = await subscriptionAccess.getSubscriptionInfo(userId)

  if (info.subscriptionStatus === 'ACTIVE') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'You already have an active subscription. Use the billing portal to manage it.'
    })
  }

  let customerId = info.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: await subscriptionAccess.getUsername(userId),
      metadata: { userId }
    })

    await subscriptionAccess.updateStripeCustomerId(userId, customer.id)
    customerId = customer.id
  }

  const priceId = TIER_TO_PRICE_ID[input.tier]
  if (!priceId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid tier' })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/subscription?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`
  })

  return { url: session.url }
}

export async function createPortalSession(userId: string, stripe: Stripe) {
  const info = await subscriptionAccess.getSubscriptionInfo(userId)

  if (!info.stripeCustomerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No billing account found.'
    })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: info.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/subscription`
  })

  return { url: session.url }
}

export async function getSubscriptionInfo(userId: string) {
  return await subscriptionAccess.getSubscriptionInfo(userId)
}

/** Dependencies the Stripe webhook entry point needs, injected so tests use fakes. */
export type StripeEventDeps = {
  stripe: Stripe
  access: SubscriptionEventAccess
}

/**
 * The outcome of handling one Stripe event, made explicit so unknown customers
 * and unhandled event types are tested no-ops rather than silent fall-through.
 */
export type HandleStripeEventResult =
  | { status: 'updated'; userId: string }
  | {
      status: 'ignored'
      reason:
        | 'unhandled_event'
        | 'unknown_customer'
        | 'stale_event'
        | 'duplicate_event'
    }

/**
 * The one seam that maps a verified Stripe event to a subscription-state change.
 * The webhook route verifies the signature and delegates here; everything the
 * money path does — customer resolution, tier resolution, and the write — lives
 * behind this entry point so it can be driven by fixture events in tests.
 */
export async function handleStripeEvent(
  event: Stripe.Event,
  deps: StripeEventDeps
): Promise<HandleStripeEventResult> {
  const { access } = deps
  // Stripe retries deliveries and does not guarantee ordering. Two guards make
  // every write idempotent and order-safe: a processed-event record keyed by the
  // event `id` dedupes any redelivery (`duplicate_event`), and the event
  // `created` time rejects a write strictly older than the last one applied
  // (`stale_event`), so neither a retry nor a late delivery can move a user's
  // Tier backwards. Keying idempotency on the recorded id — not just the last id
  // or the timestamp — lets distinct events that tie a `created` second (Stripe
  // fires several per second at checkout) still apply, while a retry of any past
  // event, not only the most recent, stays a no-op.
  const eventAt = new Date(event.created * 1000)

  switch (event.type) {
    case 'customer.subscription.created':
      return applySubscription(
        event.data.object as Stripe.Subscription,
        access,
        'ACTIVE',
        event.id,
        eventAt
      )

    case 'customer.subscription.updated':
      return applySubscription(
        event.data.object as Stripe.Subscription,
        access,
        subscriptionStatusFor(event.data.object as Stripe.Subscription),
        event.id,
        eventAt
      )

    case 'customer.subscription.deleted':
      return revokeSubscription(
        event.data.object as Stripe.Subscription,
        access,
        event.id,
        eventAt
      )

    case 'invoice.payment_failed':
      return markPaymentFailed(
        event.data.object as Stripe.Invoice,
        access,
        event.id,
        eventAt
      )

    default:
      return { status: 'ignored', reason: 'unhandled_event' }
  }
}

function getFirstItem(subscription: Stripe.Subscription) {
  return subscription.items.data[0]
}

function resolveTierFromSubscription(subscription: Stripe.Subscription) {
  const priceId = getFirstItem(subscription)?.price.id
  if (!priceId) return 'FREE' as const
  return PRICE_ID_TO_TIER[priceId] ?? ('FREE' as const)
}

function periodEndFromSubscription(subscription: Stripe.Subscription) {
  const periodEnd = getFirstItem(subscription)?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000) : null
}

function subscriptionStatusFor(subscription: Stripe.Subscription) {
  return subscription.status === 'active' ? 'ACTIVE' : 'INCOMPLETE'
}

/** The single customer-to-user resolution shared by every event branch. */
async function resolveUser(
  customer: string | { id: string } | null | undefined,
  access: SubscriptionEventAccess
): Promise<SubscriptionEventUser | null> {
  const customerId =
    typeof customer === 'string' ? customer : (customer?.id ?? null)
  if (!customerId) return null
  return access.getUserByStripeCustomerId(customerId)
}

/**
 * Resolve, guard, and write in one place so every event branch is idempotent
 * and order-safe. Returns `unknown_customer` when the customer maps to no user,
 * `duplicate_event` when this event id was already applied, `stale_event` when
 * the event is strictly older than the last one applied, and otherwise writes
 * with the event's id and timestamp.
 */
async function guardedWrite(
  user: SubscriptionEventUser | null,
  eventId: string,
  eventAt: Date,
  data: Omit<UpdateSubscriptionData, 'lastStripeEventAt' | 'lastStripeEventId'>,
  access: SubscriptionEventAccess
): Promise<HandleStripeEventResult> {
  if (!user) return { status: 'ignored', reason: 'unknown_customer' }
  if (await access.hasProcessedEvent(eventId)) {
    return { status: 'ignored', reason: 'duplicate_event' }
  }
  if (user.lastStripeEventAt && eventAt < user.lastStripeEventAt) {
    return { status: 'ignored', reason: 'stale_event' }
  }

  try {
    await access.updateSubscription(user.id, {
      ...data,
      lastStripeEventAt: eventAt,
      lastStripeEventId: eventId
    })
  } catch (error) {
    // A concurrent redelivery can pass the `hasProcessedEvent` read above and
    // only collide when it records the event id, so the same duplicate the read
    // would have caught surfaces here instead. Resolve it to the same no-op
    // rather than letting it become a retry-inducing error.
    if (error instanceof DuplicateStripeEventError) {
      return { status: 'ignored', reason: 'duplicate_event' }
    }
    throw error
  }
  return { status: 'updated', userId: user.id }
}

async function applySubscription(
  subscription: Stripe.Subscription,
  access: SubscriptionEventAccess,
  status: 'ACTIVE' | 'INCOMPLETE',
  eventId: string,
  eventAt: Date
): Promise<HandleStripeEventResult> {
  const user = await resolveUser(subscription.customer, access)
  return guardedWrite(
    user,
    eventId,
    eventAt,
    {
      stripeSubscriptionId: subscription.id,
      subscriptionTier: resolveTierFromSubscription(subscription),
      subscriptionStatus: status,
      currentPeriodEnd: periodEndFromSubscription(subscription)
    },
    access
  )
}

async function revokeSubscription(
  subscription: Stripe.Subscription,
  access: SubscriptionEventAccess,
  eventId: string,
  eventAt: Date
): Promise<HandleStripeEventResult> {
  const user = await resolveUser(subscription.customer, access)
  return guardedWrite(
    user,
    eventId,
    eventAt,
    {
      stripeSubscriptionId: null,
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELED',
      currentPeriodEnd: null
    },
    access
  )
}

async function markPaymentFailed(
  invoice: Stripe.Invoice,
  access: SubscriptionEventAccess,
  eventId: string,
  eventAt: Date
): Promise<HandleStripeEventResult> {
  const user = await resolveUser(invoice.customer, access)
  return guardedWrite(
    user,
    eventId,
    eventAt,
    {
      subscriptionTier: user?.subscriptionTier ?? 'FREE',
      subscriptionStatus: 'PAST_DUE'
    },
    access
  )
}
