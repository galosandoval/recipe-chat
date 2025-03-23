import { z } from 'zod'
import { generatedRecipeSchema } from './chats'

export const messagesSchema = z.array(
	z.object({
		content: z.string().min(1),
		role: z.enum([
			'system',
			'user',
			'assistant',
			'function',
			'data',
			'tool'
		]),
		id: z.string().optional(),
		recipes: z.array(generatedRecipeSchema).optional()
	})
)
export type MessagesSchema = z.infer<typeof messagesSchema>