import { z } from 'zod'

export const createCheckoutSchema = z.object({
  tier: z.enum(['STARTER', 'PREMIUM'])
})

export type CreateCheckoutSchema = z.infer<typeof createCheckoutSchema>
