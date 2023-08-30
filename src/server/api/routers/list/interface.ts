import { z } from 'zod'

export const ingredientSchema = z.array(
  z.object({
    id: z.number()
  })
)
export type CreateList = z.infer<typeof ingredientSchema>

export const clearListSchema = z.array(
  z.object({ id: z.number(), recipeId: z.number().nullable() })
)
export type ClearList = z.infer<typeof clearListSchema>

