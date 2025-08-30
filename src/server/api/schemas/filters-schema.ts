import { z } from 'zod'
import { idSchema, userIdSchema } from './ids-schema'

export const getFiltersByUserIdSchema = z.object({ userId: idSchema.shape.id })
export type GetFiltersByUserIdSchema = z.infer<typeof getFiltersByUserIdSchema>

export const createFilterSchema = z
  .object({
    name: z.string().min(3).max(20),
    filterId: idSchema.shape.id
  })
  .merge(userIdSchema)
export type CreateFilterSchema = z.infer<typeof createFilterSchema>

export const deleteFilterSchema = z.object({
  filterId: idSchema.shape.id
})
export type DeleteFilterSchema = z.infer<typeof deleteFilterSchema>

export const checkFilterSchema = z.object({
  filterId: idSchema.shape.id,
  checked: z.boolean()
})
export type CheckFilterSchema = z.infer<typeof checkFilterSchema>
