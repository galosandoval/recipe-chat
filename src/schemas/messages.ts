import z from 'zod'
import { generatedRecipeSchema } from './chats'

export const messagesSchema = z.array(
  z.object({
    content: z.string().min(1),
    role: z.enum(['system', 'user', 'assistant', 'function', 'data', 'tool']),
    id: z.string(),
    recipes: z.array(generatedRecipeSchema).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
)
