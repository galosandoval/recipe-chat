import { areSubscriptionsEnabled } from './billing-config'

const original = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

afterEach(() => {
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = original
})

describe('areSubscriptionsEnabled', () => {
  it('is enabled by the explicit truthy string', () => {
    process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = 'true'

    expect(areSubscriptionsEnabled()).toBe(true)
  })

  it('is disabled when the flag is unset', () => {
    delete process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

    expect(areSubscriptionsEnabled()).toBe(false)
  })

  it.each(['', 'false', 'TRUE', '1', 'yes'])(
    'is disabled for the unexpected value %p',
    (value) => {
      process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = value

      expect(areSubscriptionsEnabled()).toBe(false)
    }
  )
})
