import type Stripe from 'stripe'

/**
 * Trimmed Stripe event payloads — only the fields `handleStripeEvent` reads.
 * These stand in for recorded webhook deliveries so the money path is exercised
 * with no Stripe account and no network. The price ids below must match the
 * `~/lib/stripe-config` mock in the colocated test.
 */

export const TEST_CUSTOMER_ID = 'cus_TEST_alice'
export const UNKNOWN_CUSTOMER_ID = 'cus_TEST_nobody'
export const STARTER_PRICE_ID = 'price_starter_test'
export const PREMIUM_PRICE_ID = 'price_premium_test'
export const UNKNOWN_PRICE_ID = 'price_unmapped_test'

/** Fixed Unix seconds so the persisted `currentPeriodEnd` Date is deterministic. */
export const PERIOD_END_UNIX = 1782000000

/** Fixed `created` time (Unix seconds) stamped on every fixture event by default. */
export const EVENT_CREATED_UNIX = 1781000000

type SubscriptionOverrides = {
  id?: string
  customer?: string
  priceId?: string
  status?: Stripe.Subscription.Status
  currentPeriodEnd?: number | null
  /** `event.created` in Unix seconds — drives the ordering guard. */
  createdAt?: number
  /** `event.id` — keys idempotency; distinct ids are distinct deliveries. */
  eventId?: string
}

function subscription(
  overrides: SubscriptionOverrides = {}
): Stripe.Subscription {
  const {
    id = 'sub_TEST123',
    customer = TEST_CUSTOMER_ID,
    priceId = STARTER_PRICE_ID,
    status = 'active',
    currentPeriodEnd = PERIOD_END_UNIX
  } = overrides

  return {
    id,
    object: 'subscription',
    customer,
    status,
    items: {
      object: 'list',
      data: [
        {
          id: 'si_TEST123',
          object: 'subscription_item',
          current_period_end: currentPeriodEnd,
          price: { id: priceId, object: 'price' }
        }
      ]
    }
  } as unknown as Stripe.Subscription
}

function invoice(overrides: { customer?: string | null } = {}): Stripe.Invoice {
  const { customer = TEST_CUSTOMER_ID } = overrides
  return {
    id: 'in_TEST123',
    object: 'invoice',
    customer
  } as unknown as Stripe.Invoice
}

function event(
  type: string,
  object: unknown,
  created = EVENT_CREATED_UNIX,
  id = 'evt_TEST123'
): Stripe.Event {
  return {
    id,
    object: 'event',
    type,
    created,
    data: { object }
  } as unknown as Stripe.Event
}

export function subscriptionCreatedEvent(
  overrides: SubscriptionOverrides = {}
) {
  return event(
    'customer.subscription.created',
    subscription(overrides),
    overrides.createdAt,
    overrides.eventId
  )
}

export function subscriptionUpdatedEvent(
  overrides: SubscriptionOverrides = {}
) {
  return event(
    'customer.subscription.updated',
    subscription(overrides),
    overrides.createdAt,
    overrides.eventId
  )
}

export function subscriptionDeletedEvent(
  overrides: SubscriptionOverrides = {}
) {
  return event(
    'customer.subscription.deleted',
    subscription(overrides),
    overrides.createdAt,
    overrides.eventId
  )
}

export function paymentFailedEvent(
  overrides: {
    customer?: string | null
    createdAt?: number
    eventId?: string
  } = {}
) {
  return event(
    'invoice.payment_failed',
    invoice(overrides),
    overrides.createdAt,
    overrides.eventId
  )
}

/** An event type the webhook does not handle — must be an explicit no-op. */
export function unhandledEvent() {
  return event('payment_intent.succeeded', { id: 'pi_TEST123' })
}
