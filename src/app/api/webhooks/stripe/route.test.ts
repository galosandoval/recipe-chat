/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server'

// Both are the crash-and-write paths the switch must not reach.
jest.mock('~/lib/stripe', () => ({
  getStripe: () => {
    throw new Error('Stripe client must not be constructed')
  }
}))
jest.mock('~/server/api/use-cases/subscription-use-case', () => ({
  handleStripeEvent: () => {
    throw new Error('No event must be applied')
  }
}))

// Imported after the mocks so the route picks them up.
import { POST } from './route'

const original = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

afterEach(() => {
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = original
})

function deliveryWithoutSignature() {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: '{}'
  }) as NextRequest
}

describe('stripe webhook while subscriptions are disabled', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED
  })

  it('answers a stray delivery without touching Stripe or the database', async () => {
    const response = await POST(deliveryWithoutSignature())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ignored: true })
  })
})

describe('stripe webhook while subscriptions are enabled', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = 'true'
  })

  it('still rejects an unsigned delivery', async () => {
    const response = await POST(deliveryWithoutSignature())

    expect(response.status).toBe(400)
  })
})
