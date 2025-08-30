import z from 'zod'

export const idSchema = z.object({
  id: z.string().length(24)
})

export type IdSchema = z.infer<typeof idSchema>

export const userIdSchema = z.object({
  userId: idSchema.shape.id
})

export type UserIdSchema = z.infer<typeof userIdSchema>
