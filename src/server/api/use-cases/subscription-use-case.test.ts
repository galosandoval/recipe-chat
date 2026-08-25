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
import {
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
  readonly writes: Array<{ userId: string; data: UpdateSubscriptionData }> = []

  seed(user: SubscriptionEventUser) {
    if (user.stripeCustomerId)
      this.usersByCustomer.set(user.stripeCustomerId, user)
    return this
  }

  async getUserByStripeCustomerId(customerId: string) {
    return this.usersByCustomer.get(customerId) ?? null
  }

  async updateSubscription(userId: string, data: UpdateSubscriptionData) {
    this.writes.push({ userId, data })
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
          currentPeriodEnd: new Date(PERIOD_END_UNIX * 1000)
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
        currentPeriodEnd: null
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
        subscriptionStatus: 'PAST_DUE'
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
