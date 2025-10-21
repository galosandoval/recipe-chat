import z from 'zod'

export const generatedRecipeSchema = z.object({
  name: z.string().min(1).describe('Name of the recipe.'),

  description: z.string().min(1).describe('Short description (1–2 sentences).'),

  // Single-recipe fields (optional here; enforce in parent when recipes.length === 1)
  servings: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .describe('Number of servings. Required when only one recipe is returned.'),

  prepMinutes: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .describe(
      'Preparation time in minutes. Required when only one recipe is returned.'
    ),

  cookMinutes: z
    .number()
    .int()
    .optional()
    .nullable()
    .describe(
      'Cook time in minutes. Required when only one recipe is returned.'
    ),

  // Facets / tags you actually persist
  cuisine: z
    .string()
    .optional()
    .nullable()
    .describe('Primary cuisine, e.g., "mexican", "thai".'),

  course: z
    .string()
    .optional()
    .nullable()
    .describe('Course, e.g., "main", "side", "dessert".'),

  dietTags: z
    .array(z.string())
    .optional()
    .describe('Dietary tags, e.g., ["vegan", "gluten-free"].'),

  flavorTags: z
    .array(z.string())
    .optional()
    .describe('Flavor profile tags, e.g., ["spicy", "umami"].'),

  mainIngredients: z
    .array(z.string())
    .optional()
    .describe('Key ingredients, e.g., ["chicken", "chickpeas"].'),

  techniques: z
    .array(z.string())
    .optional()
    .describe('Cooking techniques, e.g., ["grill", "braise"].'),

  // Payload for the full single-recipe view
  ingredients: z
    .array(z.string())
    .optional()
    .describe(
      'Ingredient lines like "1 cup basmati rice, rinsed". Required when only one recipe is returned.'
    ),

  instructions: z
    .array(z.string())
    .optional()
    .describe(
      'Numbered, concise imperative steps. Required when only one recipe is returned.'
    )
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
  id: z.string(),
  slug: z.string()
})

export type GeneratedMessageWithId = z.infer<typeof generatedRecipeWithIdSchema>

export type GeneratedRecipeWithId = z.infer<typeof generatedRecipeWithIdSchema>
