import { tool } from 'ai'
import { z } from 'zod'
import { type PrismaClient } from '@prisma/client'
import {
  generatedRecipeSchema,
  recipeDetailsSchema
} from '~/schemas/messages-schema'
import type { ChatContext } from '~/schemas/chats-schema'
import { RecipesAccess } from '~/server/api/data-access/recipes-access'
import { editRecipe } from '~/server/api/use-cases/recipes-use-case'
import { dedupeRecipeOptions } from '~/server/api/use-cases/dedupe-recipe-options-use-case'
import { RECIPE_OPTIONS_OVERGENERATE } from '~/constants/chat'
import { toEditRecipeInput } from './edit-recipe-input'

export function getTools(
  context: ChatContext | undefined,
  prisma: PrismaClient,
  userId?: string
) {
  const baseTools = {
    generateRecipeOptions: tool({
      description: `Generate recipe suggestions for a new request. Propose about ${RECIPE_OPTIONS_OVERGENERATE} diverse options. Populate name, description, prepMinutes, cookMinutes, and all facet fields. Always leave ingredients, instructions, and servings null.`,
      parameters: z.object({
        message: z
          .string()
          .describe(
            'A brief intro or context message to display above the recipe cards (e.g. "Here are some options for tonight:").'
          ),
        recipes: z.array(generatedRecipeSchema)
      }),
      // Server-side execute de-duplicates the over-generated options against the
      // user's saved recipes (embeddings, off the LLM) and returns the unique
      // survivors the client renders. Fail-open — see dedupeRecipeOptions.
      async execute({ message, recipes }) {
        const unique = await dedupeRecipeOptions(userId, recipes, prisma)
        return { message, recipes: unique }
      }
    }),
    expandRecipe: tool({
      description:
        'Generate full details for a recipe that was ALREADY presented earlier in this conversation via generateRecipeOptions. Do NOT use for new requests — use generateRecipeOptions instead. Pass recipeName matching the exact name of the prior suggestion. Returns only ingredients, instructions, and servings.',
      parameters: z.object({
        recipeName: z
          .string()
          .min(1)
          .describe(
            'The exact name of the previously-suggested recipe being expanded. Must match a name from an earlier generateRecipeOptions call in this conversation.'
          ),
        message: z
          .string()
          .describe(
            'Brief confirmation message, e.g. "Here is the full recipe for BBQ Chicken Tacos:".'
          ),
        details: recipeDetailsSchema
      })
      // No execute — client handles merge and rendering
    })
  }

  if (context?.page !== 'recipe-detail') {
    return baseTools
  }

  return {
    ...baseTools,
    editRecipe: tool({
      description:
        'Edit the recipe the user is currently viewing. Use when the user asks to change the name, description, notes, prep/cook time, ingredients, or instructions.',
      parameters: z.object({
        recipeId: z.string().describe('The ID of the recipe to edit'),
        newName: z.string().optional().describe('New recipe name'),
        newDescription: z
          .string()
          .optional()
          .describe('New recipe description'),
        newNotes: z.string().optional().describe('New recipe notes'),
        newPrepMinutes: z
          .number()
          .optional()
          .describe('New prep time in minutes'),
        newCookMinutes: z
          .number()
          .optional()
          .describe('New cook time in minutes'),
        newIngredients: z
          .array(z.string())
          .optional()
          .describe('Complete list of ingredients (replaces existing)'),
        newInstructions: z
          .array(z.string())
          .optional()
          .describe('Complete list of instructions (replaces existing)')
      }),
      // Thin adapter: map the tool's parameters onto the editRecipe use-case's
      // input shape and delegate. The use-case owns the selective diff, the
      // transaction, and the re-embed policy — identical to the tRPC form edit,
      // so an assistant edit and a form edit take the same path.
      async execute({ recipeId: id, ...edits }) {
        const recipe = await new RecipesAccess(prisma).getRecipeById(id)
        if (!recipe) {
          return { success: false, error: 'Recipe not found' }
        }

        const ownerId = recipe.userId ?? userId
        if (!ownerId) {
          return { success: false, error: 'Recipe not found' }
        }

        const slug = await editRecipe(
          toEditRecipeInput(recipe, edits),
          ownerId,
          prisma
        )

        return {
          success: true,
          recipeName: edits.newName ?? recipe.name,
          slug
        }
      }
    }),
    addNote: tool({
      description:
        'Add or update notes on the recipe the user is currently viewing.',
      parameters: z.object({
        recipeId: z.string().describe('The ID of the recipe'),
        notes: z.string().describe('The notes to set on the recipe')
      }),
      async execute({ recipeId: id, notes }) {
        const recipesAccess = new RecipesAccess(prisma)
        const recipe = await recipesAccess.getRecipeById(id)
        if (!recipe) {
          return { success: false, error: 'Recipe not found' }
        }

        await recipesAccess.updateRecipe(id, { notes })
        return { success: true, recipeName: recipe.name }
      }
    })
  }
}
