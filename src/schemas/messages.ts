import z from 'zod'

export const generatedRecipeSchema = z.object({
  name: z.string().describe('Name of recipe.'),
  description: z.string().describe('Description of recipe. 1 to 2 sentences.'),
  prepTime: z
    .string()
    .optional()
    .nullable()
    .describe('Preparation time of recipe. Optional.'),
  cookTime: z
    .string()
    .optional()
    .nullable()
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

export const roleSchema = z.enum(['system', 'user', 'assistant', 'data'])

export const messageSchema = z.object({
  content: z.string().min(1),
  role: roleSchema,
  id: z.string(),
  recipes: z.array(generatedRecipeSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})
export const messagesSchema = z.array(messageSchema)

export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>

export const generatedRecipeWithIdSchema = generatedRecipeSchema.extend({
  id: z.string()
})

export type GeneratedMessageWithId = z.infer<typeof generatedRecipeWithIdSchema>

export type GeneratedRecipeWithId = z.infer<typeof generatedRecipeWithIdSchema>
