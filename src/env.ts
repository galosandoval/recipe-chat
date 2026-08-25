import { z } from 'zod'

/**
 * A variable that must be both defined and non-empty.
 *
 * An empty string is a missing variable wearing a disguise: a platform that
 * exposes an unset variable as `""` would otherwise sail through validation
 * and fail later at the point of use.
 */
const required = z.string().min(1, 'Required')

/**
 * Variables every deployment must define, whatever it sells.
 *
 * Only what the running app actually reads is required. `PORT` and
 * `DATABASE_URL` are optional on purpose: both readers of `PORT`
 * (`src/trpc/react.tsx`, `playwright.config.ts`) fall back to 3000, and
 * `DATABASE_URL` is touched only by the local `scripts/*-database.sh` helpers
 * — the app connects through `DATABASE_PRISMA_URL`. Requiring either would
 * fail a build over a variable that build never needed.
 */
const baseEnv = z.object({
  DATABASE_URL: z.string().optional(),
  DATABASE_PRISMA_URL: required,
  DATABASE_URL_NON_POOLING: required,
  NODE_ENV: required,
  NEXTAUTH_SECRET: required,
  NEXTAUTH_URL: required,
  OPENAI_API_KEY: required,
  UNSPLASH_ACCESS_KEY: required,
  // Absent means disabled (see `~/lib/billing-config`), so a deployment with
  // subscriptions off is not forced to define it.
  NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED: z.string().optional(),
  PORT: z.string().optional()
})

/**
 * Variables the money path needs — required only when Subscriptions are on.
 */
const stripeEnv = z.object({
  STRIPE_SECRET_KEY: required,
  STRIPE_WEBHOOK_SECRET: required,
  STRIPE_STARTER_PRICE_ID: required,
  STRIPE_PREMIUM_PRICE_ID: required,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: required
})

/**
 * Validates an environment at build time, failing the build rather than a
 * customer's click.
 *
 * The Stripe half is checked only when the Subscriptions flag is on, so a
 * deployment that does not sell subscriptions defines nothing it does not use,
 * while one that does cannot ship half-configured.
 *
 * The flag is compared here rather than through `areSubscriptionsEnabled`:
 * that function reads `process.env` directly on purpose, so Next can inline
 * the public value into the client bundle, while this validates whatever
 * environment it is handed.
 */
export function parseEnv(
  env: Record<string, string | undefined> = process.env
) {
  const subscriptionsEnabled = env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true'
  const schema = subscriptionsEnabled ? baseEnv.merge(stripeEnv) : baseEnv

  const result = schema.safeParse(env)
  if (!result.success) {
    throw new Error(formatIssues(result.error))
  }
  return result.data
}

/**
 * Turns a Zod failure into a message that names each offending variable, so a
 * failed build says what to define instead of dumping a schema error.
 */
function formatIssues(error: z.ZodError) {
  const lines = error.issues.map(
    (issue) => `  ${issue.path.join('.')}: ${issue.message}`
  )
  return `Invalid environment variables:\n${lines.join('\n')}`
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv
      extends z.infer<typeof baseEnv>,
        z.infer<typeof stripeEnv> {}
  }
}
