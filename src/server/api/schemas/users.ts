import { z } from 'zod'
import { roleSchema } from '~/schemas/messages'

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(20)
})
export type SignUpSchema = z.infer<typeof signUpSchema>

export const createChatAndRecipeSchema = z.object({
  recipe: z.object({
    description: z.string().optional(),
    name: z.string(),
    imgUrl: z.string().optional(),
    author: z.string().optional(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    prepTime: z.string().optional(),
    cookTime: z.string().optional()
  }),
  messages: z
    .object({
      content: z.string().min(1),
      role: roleSchema
    })
    .array()
})
export type CreateChatAndRecipeSchema = z.infer<
  typeof createChatAndRecipeSchema
>
