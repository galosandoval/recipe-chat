import { z } from 'zod'
import type { Message as OpenAIMessage } from 'ai'

export type Message = OpenAIMessage & { recipes?: GeneratedRecipes['recipes'] }

export const generatedRecipesSchema = z.object({
	message: z.string().describe('Helpful message.'),
	recipes: z
		.array(
			z.object({
				name: z.string().describe('Name of recipe.'),
				description: z.string().describe('Description of recipe.'),
				prepTime: z
					.string()
					.optional()
					.describe('Preparation time of recipe. Optional.'),
				cookTime: z
					.string()
					.optional()
					.describe('Cook time of recipe. Optional.'),
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
		)
		.describe('Array of recipes.')
})
export type GeneratedRecipes = z.infer<typeof generatedRecipesSchema>

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
