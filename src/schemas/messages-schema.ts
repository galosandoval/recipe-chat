import z from 'zod'

export const generatedRecipeSchema = z.object({
  name: z.string().min(1).describe('Name of the recipe.'),

  description: z.string().min(1).describe('Short description (1–2 sentences).'),

  prepMinutes: z
    .number()
    .nullish()
    .describe('Prep time in minutes.'),

  cookMinutes: z
    .number()
    .nullish()
    .describe('Cook time in minutes.'),

  // Facets / tags you actually persist
  cuisine: z
    .string()
    .nullable()
    .describe('Primary cuisine, e.g., "mexican", "thai".'),

  course: z
    .string()
    .nullable()
    .describe('Course, e.g., "main", "side", "dessert".'),

  dietTags: z
    .array(z.string())
    .nullable()
    .describe('Dietary tags, e.g., ["vegan", "gluten-free"].'),

  flavorTags: z
    .array(z.string())
    .nullable()
    .describe('Flavor profile tags, e.g., ["spicy", "umami"].'),

  mainIngredients: z
    .array(z.string())
    .nullable()
    .describe('Key ingredients, e.g., ["chicken", "chickpeas"].'),

  techniques: z
    .array(z.string())
    .nullable()
    .describe('Cooking techniques, e.g., ["grill", "braise"].')
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

export const recipeDetailsSchema = z.object({
  ingredients: z.array(z.string()).describe('Full ingredient list.'),
  instructions: z.array(z.string()).describe('Full step-by-step instructions.'),
  servings: z.number().describe('Number of servings.')
})

export type RecipeDetails = z.infer<typeof recipeDetailsSchema>

export const fullRecipeSchema = generatedRecipeSchema.merge(recipeDetailsSchema)
export type FullRecipe = z.infer<typeof fullRecipeSchema>

export const generatedRecipeWithIdSchema = generatedRecipeSchema.extend({
  id: z.string(),
  slug: z.string(),
  ingredients: z.array(z.string()).nullish(),
  instructions: z.array(z.string()).nullish(),
  servings: z.number().nullish()
})

export type GeneratedMessageWithId = z.infer<typeof generatedRecipeWithIdSchema>

export type GeneratedRecipeWithId = z.infer<typeof generatedRecipeWithIdSchema>
