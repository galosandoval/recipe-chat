import { z } from 'zod'
import { messageRole } from './chats'

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
			role: z.enum(messageRole)
		})
		.array()
})
export type CreateChatAndRecipeSchema = z.infer<
	typeof createChatAndRecipeSchema
>
