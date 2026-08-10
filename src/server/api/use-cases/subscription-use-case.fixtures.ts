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

type SubscriptionOverrides = {
  id?: string
  customer?: string
  priceId?: string
  status?: Stripe.Subscription.Status
  currentPeriodEnd?: number | null
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

function event(type: string, object: unknown): Stripe.Event {
  return {
    id: 'evt_TEST123',
    object: 'event',
    type,
    data: { object }
  } as unknown as Stripe.Event
}

export function subscriptionCreatedEvent(
  overrides: SubscriptionOverrides = {}
) {
  return event('customer.subscription.created', subscription(overrides))
}

export function subscriptionUpdatedEvent(
  overrides: SubscriptionOverrides = {}
) {
  return event('customer.subscription.updated', subscription(overrides))
}

export function subscriptionDeletedEvent(
  overrides: SubscriptionOverrides = {}
) {
  return event('customer.subscription.deleted', subscription(overrides))
}

export function paymentFailedEvent(
  overrides: { customer?: string | null } = {}
) {
  return event('invoice.payment_failed', invoice(overrides))
}

/** An event type the webhook does not handle — must be an explicit no-op. */
export function unhandledEvent() {
  return event('payment_intent.succeeded', { id: 'pi_TEST123' })
}
