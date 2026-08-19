import { z } from 'zod'
import type { SubscriptionTier } from '@prisma/client'

/**
 * The tiers a user can actually check out into — every {@link SubscriptionTier}
 * except `FREE`, which nobody pays for. `satisfies` keeps these in step with
 * Prisma: renaming a tier there breaks this list rather than silently leaving
 * checkout offering a tier that no longer exists.
 */
const purchasableTiers = [
  'STARTER',
  'PREMIUM'
] as const satisfies readonly SubscriptionTier[]

export const createCheckoutSchema = z.object({
  tier: z.enum(purchasableTiers)
})

export type CreateCheckoutSchema = z.infer<typeof createCheckoutSchema>
