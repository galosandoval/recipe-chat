import { z } from 'zod'
import { idSchema } from '~/schemas/ids-schema'

export const getFiltersByUserIdSchema = z.object({ userId: idSchema.shape.id })
export type GetFiltersByUserIdSchema = z.infer<typeof getFiltersByUserIdSchema>

export const checkFilterSchema = z.object({
  filterId: idSchema.shape.id,
  checked: z.boolean()
})
export type CheckFilterSchema = z.infer<typeof checkFilterSchema>

/** A single filter's desired state in a {@link saveFiltersSchema} payload. */
export const draftFilterSchema = z.object({
  id: idSchema.shape.id,
  name: z
    .string()
    .min(3, 'filters.minChars3')
    .max(50, 'filters.maxChars50')
    .refine((name) => !name.includes('_'), {
      message: 'filters.charNotAllowedUnderscore'
    })
})
export type DraftFilterSchema = z.infer<typeof draftFilterSchema>

/** The full desired set of filters for a user, reconciled in one save. */
export const saveFiltersSchema = z.object({
  filters: z.array(draftFilterSchema)
})
export type SaveFiltersSchema = z.infer<typeof saveFiltersSchema>
