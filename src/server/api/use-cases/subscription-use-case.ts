import { TRPCError } from '@trpc/server'
import type Stripe from 'stripe'
import {
  subscriptionAccess,
  type SubscriptionEventAccess,
  type SubscriptionEventUser
} from '~/server/api/data-access/subscription-access'
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
    return_url: `${process.env.NEXTAUTH_URL}/en/subscription`
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
  | { status: 'ignored'; reason: 'unhandled_event' | 'unknown_customer' }

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

  switch (event.type) {
    case 'customer.subscription.created':
      return applySubscription(
        event.data.object as Stripe.Subscription,
        access,
        'ACTIVE'
      )

    case 'customer.subscription.updated':
      return applySubscription(
        event.data.object as Stripe.Subscription,
        access,
        subscriptionStatusFor(event.data.object as Stripe.Subscription)
      )

    case 'customer.subscription.deleted':
      return revokeSubscription(
        event.data.object as Stripe.Subscription,
        access
      )

    case 'invoice.payment_failed':
      return markPaymentFailed(event.data.object as Stripe.Invoice, access)

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

async function applySubscription(
  subscription: Stripe.Subscription,
  access: SubscriptionEventAccess,
  status: 'ACTIVE' | 'INCOMPLETE'
): Promise<HandleStripeEventResult> {
  const user = await resolveUser(subscription.customer, access)
  if (!user) return { status: 'ignored', reason: 'unknown_customer' }

  await access.updateSubscription(user.id, {
    stripeSubscriptionId: subscription.id,
    subscriptionTier: resolveTierFromSubscription(subscription),
    subscriptionStatus: status,
    currentPeriodEnd: periodEndFromSubscription(subscription)
  })
  return { status: 'updated', userId: user.id }
}

async function revokeSubscription(
  subscription: Stripe.Subscription,
  access: SubscriptionEventAccess
): Promise<HandleStripeEventResult> {
  const user = await resolveUser(subscription.customer, access)
  if (!user) return { status: 'ignored', reason: 'unknown_customer' }

  await access.updateSubscription(user.id, {
    stripeSubscriptionId: null,
    subscriptionTier: 'FREE',
    subscriptionStatus: 'CANCELED',
    currentPeriodEnd: null
  })
  return { status: 'updated', userId: user.id }
}

async function markPaymentFailed(
  invoice: Stripe.Invoice,
  access: SubscriptionEventAccess
): Promise<HandleStripeEventResult> {
  const user = await resolveUser(invoice.customer, access)
  if (!user) return { status: 'ignored', reason: 'unknown_customer' }

  await access.updateSubscription(user.id, {
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: 'PAST_DUE'
  })
  return { status: 'updated', userId: user.id }
}
