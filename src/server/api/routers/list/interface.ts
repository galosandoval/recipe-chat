import { z } from 'zod'

export const ingredientSchema = z.array(
  z.object({
    id: z.number()
  })
)
export const clearListSchema = z.array(z.object({ id: z.number() }))

export const addIngredientSchema = z.object({
  newIngredientName: z.string().min(3).max(50)
})

export type CreateList = z.infer<typeof ingredientSchema>
