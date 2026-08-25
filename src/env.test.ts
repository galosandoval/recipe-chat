/**
 * @jest-environment node
 */
import { parseEnv } from './env'

const baseVars = {
  DATABASE_URL: 'postgres://base',
  DATABASE_PRISMA_URL: 'postgres://prisma',
  DATABASE_URL_NON_POOLING: 'postgres://direct',
  NODE_ENV: 'test',
  NEXTAUTH_SECRET: 'secret',
  NEXTAUTH_URL: 'http://localhost:3000',
  OPENAI_API_KEY: 'sk-test',
  UNSPLASH_ACCESS_KEY: 'unsplash'
}

const stripeVars = {
  STRIPE_SECRET_KEY: 'sk_test',
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
  STRIPE_STARTER_PRICE_ID: 'price_starter',
  STRIPE_PREMIUM_PRICE_ID: 'price_premium',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test'
}

describe('parseEnv', () => {
  describe('with subscriptions off', () => {
    it('passes with no Stripe variables defined', () => {
      expect(() => parseEnv(baseVars)).not.toThrow()
    })

    it.each(['', 'false', 'TRUE', '1'])(
      'treats the unexpected flag value %p as off',
      (value) => {
        expect(() =>
          parseEnv({ ...baseVars, NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED: value })
        ).not.toThrow()
      }
    )

    it('ignores Stripe variables left behind empty', () => {
      const emptied = Object.fromEntries(
        Object.keys(stripeVars).map((key) => [key, ''])
      )

      expect(() => parseEnv({ ...baseVars, ...emptied })).not.toThrow()
    })

    it.each([undefined, ''])(
      'still requires the base variables — NEXTAUTH_URL as %p',
      (value) => {
        expect(() => parseEnv({ ...baseVars, NEXTAUTH_URL: value })).toThrow(
          /NEXTAUTH_URL/
        )
      }
    )
  })

  describe('with subscriptions on', () => {
    const enabled = { ...baseVars, NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED: 'true' }

    it('passes when every Stripe variable is defined', () => {
      expect(() => parseEnv({ ...enabled, ...stripeVars })).not.toThrow()
    })

    it.each(Object.keys(stripeVars))('fails when %s is missing', (missing) => {
      expect(() =>
        parseEnv({ ...enabled, ...stripeVars, [missing]: undefined })
      ).toThrow(new RegExp(missing))
    })

    it.each(Object.keys(stripeVars))('fails when %s is empty', (empty) => {
      expect(() =>
        parseEnv({ ...enabled, ...stripeVars, [empty]: '' })
      ).toThrow(new RegExp(empty))
    })

    it('names every missing Stripe variable at once', () => {
      expect(() => parseEnv(enabled)).toThrow(
        /STRIPE_SECRET_KEY.*STRIPE_WEBHOOK_SECRET/s
      )
    })
  })

  it('returns the parsed environment', () => {
    expect(parseEnv(baseVars).NEXTAUTH_URL).toBe('http://localhost:3000')
  })
})
