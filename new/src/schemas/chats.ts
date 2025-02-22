import { z } from 'zod'

export const generatedRecipeSchema = z.object({
	name: z.string().describe('Name of recipe.'),
	description: z.string().describe('Description of recipe.'),
	prepTime: z.string().describe('Preparation time of recipe.'),
	cookTime: z.string().describe('Cook time of recipe.'),
	categories: z.array(z.string()).describe('Array of recipe categories.'),
	instructions: z.array(z.string()).describe('Array of instructions.'),
	ingredients: z.array(z.string()).describe('Array of ingredients.')
})
export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>

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
