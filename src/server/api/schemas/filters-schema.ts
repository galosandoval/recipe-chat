import { z } from 'zod'
import { withPrisma } from '../use-cases/use-case'
import { idSchema, userIdSchema } from './ids-schema'

export const getFiltersByUserIdSchema = z.object({ userId: z.string().cuid() })
export type GetFiltersByUserIdSchema = z.infer<typeof getFiltersByUserIdSchema>

export const createFilterSchema = z
  .object({
    name: z.string().min(3).max(20),
    filterId: idSchema.shape.id,
    chatId: idSchema.shape.id
  })
  .merge(userIdSchema)
export type CreateFilterSchema = z.infer<typeof createFilterSchema>

export const createFilterSchemaWithPrisma = withPrisma.merge(createFilterSchema)
export type CreateFilterSchemaWithPrisma = z.infer<
  typeof createFilterSchemaWithPrisma
>

export const deleteFilterSchema = z.object({
  filterId: idSchema.shape.id
})
export type DeleteFilterSchema = z.infer<typeof deleteFilterSchema>

export const checkFilterSchema = z.object({
  filterId: idSchema.shape.id,
  checked: z.boolean()
})
export type CheckFilterSchema = z.infer<typeof checkFilterSchema>
