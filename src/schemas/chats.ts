import { z } from 'zod'
import type { Message as AIMessage } from 'ai'

export type Message = AIMessage & { recipes?: GeneratedRecipe[] }

export const generatedRecipeSchema = z.object({
	name: z.string().describe('Name of recipe.'),
	description: z.string().describe('Description of recipe.'),
	prepTime: z
		.string()
		.optional()
		.describe('Preparation time of recipe. Optional.'),
	cookTime: z.string().optional().describe('Cook time of recipe. Optional.'),
	categories: z
		.array(z.string())
		.optional()
		.describe('Array of recipe categories. Optional.'),
	ingredients: z
		.array(z.string())
		.optional()
		.describe('Array of ingredients. Optional.'),
	instructions: z
		.array(z.string())
		.optional()
		.describe('Array of instructions. Optional.')
})
export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>

export const generatedMessageSchema = z.object({
	message: z.string().describe('Helpful message.'),
	recipes: z.array(generatedRecipeSchema).describe('Array of recipes.')
})
export type GeneratedMessage = z.infer<typeof generatedMessageSchema>

export const messageRole = ['assistant', 'data', 'user', 'system'] as const

export const chatParams = z.object({
	messages: z.array(
		z.object({
			role: z.enum(messageRole),
			content: z.string()
		})
	),
	filters: z.array(z.string())
})

export type ChatParams = z.infer<typeof chatParams>
