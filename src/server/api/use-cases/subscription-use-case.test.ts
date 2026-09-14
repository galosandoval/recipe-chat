/**
 * @jest-environment node
 */
import type Stripe from 'stripe'
import {
  createCheckoutSession,
  createPortalSession,
  handleStripeEvent,
  type HandleStripeEventResult
} from '~/server/api/use-cases/subscription-use-case'
import {
  subscriptionAccess,
  type SubscriptionEventAccess,
  type SubscriptionEventUser,
  type UpdateSubscriptionData
} from '~/server/api/data-access/subscription-access'
import { DuplicateStripeEventError } from '~/server/api/data-access/subscription-errors'
import {
  EVENT_CREATED_UNIX,
  PERIOD_END_UNIX,
  PREMIUM_PRICE_ID,
  STARTER_PRICE_ID,
  TEST_CUSTOMER_ID,
  UNKNOWN_CUSTOMER_ID,
  UNKNOWN_PRICE_ID,
  paymentFailedEvent,
  subscriptionCreatedEvent,
  subscriptionDeletedEvent,
  subscriptionUpdatedEvent,
  unhandledEvent
} from '~/server/api/use-cases/subscription-use-case.fixtures'

// The real price->tier map is built from env at import time; pin it to the
// fixture price ids so the resolution rule is deterministic with no Stripe env.
jest.mock('~/lib/stripe-config', () => ({
  PRICE_ID_TO_TIER: {
    price_starter_test: 'STARTER',
    price_premium_test: 'PREMIUM'
  },
  TIER_TO_PRICE_ID: {
    STARTER: 'price_starter_test',
    PREMIUM: 'price_premium_test'
  }
}))

// The checkout and portal paths reach the database through the module
// singleton rather than the injected seam handleStripeEvent uses; only the
// one read those two paths make is faked here.
jest.mock('~/server/api/data-access/subscription-access', () => ({
  subscriptionAccess: {
    getSubscriptionInfo: jest.fn()
  }
}))

/** In-memory adapter implementing the data-access seam — the test-side port. */
class FakeSubscriptionAccess implements SubscriptionEventAccess {
  private readonly usersByCustomer = new Map<string, SubscriptionEventUser>()
  private readonly usersById = new Map<string, SubscriptionEventUser>()
  private readonly processedEvents = new Set<string>()
  readonly writes: Array<{ userId: string; data: UpdateSubscriptionData }> = []

  seed(user: SubscriptionEventUser) {
    if (user.stripeCustomerId)
      this.usersByCustomer.set(user.stripeCustomerId, user)
    this.usersById.set(user.id, user)
    return this
  }

  async getUserByStripeCustomerId(customerId: string) {
    return this.usersByCustomer.get(customerId) ?? null
  }

  async hasProcessedEvent(eventId: string) {
    return this.processedEvents.has(eventId)
  }

  async updateSubscription(userId: string, data: UpdateSubscriptionData) {
    this.writes.push({ userId, data })
    // Persist the write so successive events see the updated state — this is
    // what makes idempotency and ordering observable across two deliveries.
    const user = this.usersById.get(userId)
    if (user) Object.assign(user, data)
    // Record the event id in the same step as the write, mirroring production's
    // transaction, so any later redelivery of it is deduped.
    if (data.lastStripeEventId) this.processedEvents.add(data.lastStripeEventId)
    return undefined
  }

  get lastWrite() {
    return this.writes[this.writes.length - 1]
  }
}

const mockedAccess = jest.mocked(subscriptionAccess)

// handleStripeEvent never touches the Stripe client on the webhook path; a bare
// stub proves the seam accepts an injected client without any network.
const fakeStripe = {} as unknown as Stripe

function knownUser(
  overrides: Partial<SubscriptionEventUser> = {}
): SubscriptionEventUser {
  return {
    id: 'user_alice',
    stripeCustomerId: TEST_CUSTOMER_ID,
    stripeSubscriptionId: null,
    subscriptionTier: 'FREE',
    subscriptionStatus: null,
    lastStripeEventAt: null,
    lastStripeEventId: null,
    ...overrides
  }
}

function run(event: Stripe.Event, access: FakeSubscriptionAccess) {
  return handleStripeEvent(event, { stripe: fakeStripe, access })
}

describe('handleStripeEvent', () => {
  describe('checkout completed (customer.subscription.created)', () => {
    it('activates the paid tier with the subscription id and period end', async () => {
      const access = new FakeSubscriptionAccess().seed(knownUser())

      const result = await run(
        subscriptionCreatedEvent({ priceId: STARTER_PRICE_ID }),
        access
      )

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'updated',
        userId: 'user_alice'
      })
      expect(access.lastWrite).toEqual({
        userId: 'user_alice',
        data: {
          stripeSubscriptionId: 'sub_TEST123',
          subscriptionTier: 'STARTER',
          subscriptionStatus: 'ACTIVE',
          currentPeriodEnd: new Date(PERIOD_END_UNIX * 1000),
          lastStripeEventAt: new Date(EVENT_CREATED_UNIX * 1000),
          lastStripeEventId: 'evt_TEST123'
        }
      })
    })
  })

  describe('plan change (customer.subscription.updated)', () => {
    it('updates the tier, status, and period end to match the new plan', async () => {
      const access = new FakeSubscriptionAccess().seed(
        knownUser({ subscriptionTier: 'STARTER', subscriptionStatus: 'ACTIVE' })
      )

      const result = await run(
        subscriptionUpdatedEvent({
          priceId: PREMIUM_PRICE_ID,
          status: 'active'
        }),
        access
      )

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'updated',
        userId: 'user_alice'
      })
      expect(access.lastWrite.data).toMatchObject({
        subscriptionTier: 'PREMIUM',
        subscriptionStatus: 'ACTIVE'
      })
    })

    it('marks a non-active subscription INCOMPLETE', async () => {
      const access = new FakeSubscriptionAccess().seed(knownUser())

      await run(
        subscriptionUpdatedEvent({
          priceId: PREMIUM_PRICE_ID,
          status: 'past_due'
        }),
        access
      )

      expect(access.lastWrite.data.subscriptionStatus).toBe('INCOMPLETE')
    })
  })

  describe('cancellation (customer.subscription.deleted)', () => {
    it('downgrades to FREE, CANCELED, clearing the subscription and period', async () => {
      const access = new FakeSubscriptionAccess().seed(
        knownUser({
          subscriptionTier: 'PREMIUM',
          subscriptionStatus: 'ACTIVE',
          stripeSubscriptionId: 'sub_TEST123'
        })
      )

      const result = await run(subscriptionDeletedEvent(), access)

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'updated',
        userId: 'user_alice'
      })
      expect(access.lastWrite.data).toEqual({
        stripeSubscriptionId: null,
        subscriptionTier: 'FREE',
        subscriptionStatus: 'CANCELED',
        currentPeriodEnd: null,
        lastStripeEventAt: new Date(EVENT_CREATED_UNIX * 1000),
        lastStripeEventId: 'evt_TEST123'
      })
    })
  })

  describe('payment failed (invoice.payment_failed)', () => {
    it('sets PAST_DUE while preserving the current tier', async () => {
      const access = new FakeSubscriptionAccess().seed(
        knownUser({ subscriptionTier: 'PREMIUM', subscriptionStatus: 'ACTIVE' })
      )

      const result = await run(paymentFailedEvent(), access)

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'updated',
        userId: 'user_alice'
      })
      expect(access.lastWrite.data).toEqual({
        subscriptionTier: 'PREMIUM',
        subscriptionStatus: 'PAST_DUE',
        lastStripeEventAt: new Date(EVENT_CREATED_UNIX * 1000),
        lastStripeEventId: 'evt_TEST123'
      })
    })
  })

  describe('explicit no-ops', () => {
    it('ignores an event for an unknown customer without writing', async () => {
      const access = new FakeSubscriptionAccess().seed(knownUser())

      const result = await run(
        subscriptionCreatedEvent({ customer: UNKNOWN_CUSTOMER_ID }),
        access
      )

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'ignored',
        reason: 'unknown_customer'
      })
      expect(access.writes).toHaveLength(0)
    })

    it('ignores an invoice with no customer without writing', async () => {
      const access = new FakeSubscriptionAccess().seed(knownUser())

      const result = await run(paymentFailedEvent({ customer: null }), access)

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'ignored',
        reason: 'unknown_customer'
      })
      expect(access.writes).toHaveLength(0)
    })

    it('ignores an unhandled event type without writing', async () => {
      const access = new FakeSubscriptionAccess().seed(knownUser())

      const result = await run(unhandledEvent(), access)

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'ignored',
        reason: 'unhandled_event'
      })
      expect(access.writes).toHaveLength(0)
    })
  })

  describe('idempotency and ordering', () => {
    it('leaves the same stored state when the same event is delivered twice', async () => {
      const access = new FakeSubscriptionAccess().seed(knownUser())
      const event = subscriptionCreatedEvent({ priceId: STARTER_PRICE_ID })

      const first = await run(event, access)
      const second = await run(event, access)

      expect(first).toEqual<HandleStripeEventResult>({
        status: 'updated',
        userId: 'user_alice'
      })
      expect(second).toEqual<HandleStripeEventResult>({
        status: 'ignored',
        reason: 'duplicate_event'
      })
      // The redelivery is a no-op: one write, tier unchanged from the first.
      expect(access.writes).toHaveLength(1)
      expect(access.lastWrite.data.subscriptionTier).toBe('STARTER')
    })

    it('does not overwrite state with an event older than what is stored', async () => {
      const access = new FakeSubscriptionAccess().seed(
        knownUser({
          subscriptionTier: 'PREMIUM',
          subscriptionStatus: 'ACTIVE',
          stripeSubscriptionId: 'sub_TEST123',
          lastStripeEventAt: new Date(EVENT_CREATED_UNIX * 1000)
        })
      )

      const result = await run(
        subscriptionUpdatedEvent({
          priceId: STARTER_PRICE_ID,
          status: 'active',
          createdAt: EVENT_CREATED_UNIX - 1000
        }),
        access
      )

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'ignored',
        reason: 'stale_event'
      })
      expect(access.writes).toHaveLength(0)
    })

    it('ignores a redelivery of an earlier same-second event without moving the tier back', async () => {
      // At checkout Stripe fires created + updated in the same second. Once both
      // are applied, a retry of the earlier `created` must stay a no-op. Keying
      // idempotency on only the last event id would miss it — its id no longer
      // ties the last one, and its `created` second is not strictly older — so
      // it would wrongly re-apply and drop the tier back to the starter plan.
      const access = new FakeSubscriptionAccess().seed(knownUser())

      await run(
        subscriptionCreatedEvent({
          eventId: 'evt_created',
          priceId: STARTER_PRICE_ID
        }),
        access
      )
      await run(
        subscriptionUpdatedEvent({
          eventId: 'evt_updated',
          priceId: PREMIUM_PRICE_ID,
          status: 'active'
        }),
        access
      )

      const redelivered = await run(
        subscriptionCreatedEvent({
          eventId: 'evt_created',
          priceId: STARTER_PRICE_ID
        }),
        access
      )

      expect(redelivered).toEqual<HandleStripeEventResult>({
        status: 'ignored',
        reason: 'duplicate_event'
      })
      expect(access.lastWrite.data.subscriptionTier).toBe('PREMIUM')
    })

    it('applies a distinct event that shares a timestamp with the last one', async () => {
      // Stripe fires several events in the same second at checkout; a distinct,
      // later event must not be dropped just because its `created` second ties
      // the last one applied.
      const access = new FakeSubscriptionAccess().seed(knownUser())

      await run(
        subscriptionCreatedEvent({
          eventId: 'evt_created',
          priceId: STARTER_PRICE_ID
        }),
        access
      )
      const result = await run(
        subscriptionUpdatedEvent({
          eventId: 'evt_updated',
          priceId: PREMIUM_PRICE_ID,
          status: 'active'
        }),
        access
      )

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'updated',
        userId: 'user_alice'
      })
      expect(access.lastWrite.data.subscriptionTier).toBe('PREMIUM')
    })

    it('treats a write that loses the processed-event race as a duplicate no-op', async () => {
      // Two concurrent deliveries of the same event can both pass the dedupe
      // read before either records the id; the loser then collides on the
      // processed-event record. That collision must resolve to the same
      // duplicate_event no-op a sequential redelivery gets, not a thrown error
      // that makes Stripe retry.
      const access: SubscriptionEventAccess = {
        async getUserByStripeCustomerId() {
          return knownUser()
        },
        async hasProcessedEvent() {
          return false
        },
        async updateSubscription() {
          throw new DuplicateStripeEventError('evt_TEST123')
        }
      }

      const result = await handleStripeEvent(
        subscriptionCreatedEvent({ priceId: STARTER_PRICE_ID }),
        { stripe: fakeStripe, access }
      )

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'ignored',
        reason: 'duplicate_event'
      })
    })

    it('applies an event newer than what is stored', async () => {
      const access = new FakeSubscriptionAccess().seed(
        knownUser({
          subscriptionTier: 'STARTER',
          subscriptionStatus: 'ACTIVE',
          lastStripeEventAt: new Date(EVENT_CREATED_UNIX * 1000)
        })
      )

      const result = await run(
        subscriptionUpdatedEvent({
          priceId: PREMIUM_PRICE_ID,
          status: 'active',
          createdAt: EVENT_CREATED_UNIX + 1000
        }),
        access
      )

      expect(result).toEqual<HandleStripeEventResult>({
        status: 'updated',
        userId: 'user_alice'
      })
      expect(access.lastWrite.data).toMatchObject({
        subscriptionTier: 'PREMIUM',
        lastStripeEventAt: new Date((EVENT_CREATED_UNIX + 1000) * 1000)
      })
    })
  })

  describe('price -> tier resolution', () => {
    it.each([
      [STARTER_PRICE_ID, 'STARTER'],
      [PREMIUM_PRICE_ID, 'PREMIUM'],
      [UNKNOWN_PRICE_ID, 'FREE']
    ])('maps price %s to tier %s', async (priceId, tier) => {
      const access = new FakeSubscriptionAccess().seed(knownUser())

      await run(subscriptionCreatedEvent({ priceId }), access)

      expect(access.lastWrite.data.subscriptionTier).toBe(tier)
    })
  })
})

const APP_URL = 'https://recipechat.test'
const ORIGINAL_APP_URL = process.env.NEXTAUTH_URL

/** A Stripe double whose only job is to record the session args handed to it. */
function sessionSpy() {
  const create = jest.fn().mockResolvedValue({ url: 'https://stripe.test' })
  return { create }
}

beforeEach(() => {
  process.env.NEXTAUTH_URL = APP_URL
  mockedAccess.getSubscriptionInfo.mockResolvedValue({
    stripeCustomerId: TEST_CUSTOMER_ID,
    stripeSubscriptionId: null,
    subscriptionTier: 'FREE',
    subscriptionStatus: null,
    currentPeriodEnd: null
  })
})

afterEach(() => {
  process.env.NEXTAUTH_URL = ORIGINAL_APP_URL
})

describe('createPortalSession', () => {
  it('returns customers to the unprefixed subscription path the app serves', async () => {
    const { create } = sessionSpy()

    await createPortalSession('user_alice', {
      billingPortal: { sessions: { create } }
    } as unknown as Stripe)

    expect(create).toHaveBeenCalledWith({
      customer: TEST_CUSTOMER_ID,
      return_url: `${APP_URL}/subscription`
    })
  })
})

describe('createCheckoutSession', () => {
  it('sends customers back to the unprefixed subscription path', async () => {
    const { create } = sessionSpy()

    await createCheckoutSession('user_alice', { tier: 'STARTER' }, {
      checkout: { sessions: { create } }
    } as unknown as Stripe)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: `${APP_URL}/subscription?success=true`,
        cancel_url: `${APP_URL}/subscription?canceled=true`
      })
    )
  })
})
