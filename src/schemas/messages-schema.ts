import z from 'zod'
import type { Role } from '~/generated/prisma/client'

export const generatedRecipeSchema = z.object({
  name: z.string().min(1).describe('Name of the recipe.'),

  description: z.string().min(1).describe('Short description (1–2 sentences).'),

  prepMinutes: z.number().nullish().describe('Prep time in minutes.'),

  cookMinutes: z.number().nullish().describe('Cook time in minutes.'),

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

/**
 * The message roles, mirroring Prisma's `Role` enum.
 *
 * Written as a `Record<Role, true>` so the compiler enforces the mirror in
 * both directions: a role Prisma doesn't have is rejected, and a role Prisma
 * gains is a missing-key error here. A type-only import keeps
 * the generated Prisma client out of the client bundle.
 */
const roleKeys: Record<Role, true> = {
  system: true,
  user: true,
  assistant: true,
  data: true
}

const roleValues = Object.keys(roleKeys) as [Role, ...Role[]]

export const roleSchema = z.enum(roleValues)

/**
 * The roles the model actually streams. `data` is a transport-only role the
 * chat SDK uses for side-channel payloads, so it is filtered out before
 * messages are handed to the model.
 */
export type StreamRole = Exclude<Role, 'data'>

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
