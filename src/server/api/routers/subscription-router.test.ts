/**
 * @jest-environment node
 */
import { TRPCError } from '@trpc/server'
import type { Session } from 'next-auth'

jest.mock('~/server/auth', () => ({ auth: jest.fn() }))

// Building a Stripe client from unset live keys is the crash this switch exists
// to prevent, so reaching it fails the test.
jest.mock('~/lib/stripe', () => ({
  getStripe: () => {
    throw new Error('Stripe client must not be constructed')
  }
}))

// Imported after the mocks so the router picks them up.
import { createCallerFactory } from '~/server/api/trpc'
import { subscriptionRouter } from './subscription-router'

const session = {
  user: { id: 'user-1', listId: 'list-1', subscriptionTier: 'FREE' },
  expires: '2099-01-01T00:00:00.000Z'
} as Session

const caller = createCallerFactory(subscriptionRouter)({
  session,
  headers: new Headers()
})

const original = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

afterEach(() => {
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = original
})

describe('subscription procedures while subscriptions are disabled', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED
  })

  it('refuses createCheckout with PRECONDITION_FAILED', async () => {
    await expect(caller.createCheckout({ tier: 'STARTER' })).rejects.toThrow(
      expect.objectContaining({
        code: 'PRECONDITION_FAILED',
        message: 'Subscriptions are not enabled.'
      }) as TRPCError
    )
  })

  it('refuses createPortalSession with PRECONDITION_FAILED', async () => {
    await expect(caller.createPortalSession()).rejects.toThrow(
      expect.objectContaining({
        code: 'PRECONDITION_FAILED',
        message: 'Subscriptions are not enabled.'
      }) as TRPCError
    )
  })
})
