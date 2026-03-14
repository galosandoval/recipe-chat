import { tool } from 'ai'
import { z } from 'zod'
import { type PrismaClient } from '@prisma/client'
import { generatedRecipeSchema } from '~/schemas/messages-schema'
import type { ChatContext } from '~/schemas/chats-schema'
import { RecipesAccess } from '~/server/api/data-access/recipes-access'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'
import { slugify } from '~/lib/utils'

export function getTools(context: ChatContext | undefined, prisma: PrismaClient) {
  const baseTools = {
    generateRecipes: tool({
      description: 'Generate recipe suggestions for the user. Use this whenever suggesting recipes.',
      parameters: z.object({
        recipes: z.array(generatedRecipeSchema)
      })
      // No execute — model fills structured data, client renders it
    })
  }

  if (context?.page !== 'recipe-detail') {
    return baseTools
  }

  return {
    ...baseTools,
    editRecipe: tool({
      description: 'Edit the recipe the user is currently viewing. Use when the user asks to change the name, description, notes, prep/cook time, ingredients, or instructions.',
      parameters: z.object({
        recipeId: z.string().describe('The ID of the recipe to edit'),
        newName: z.string().optional().describe('New recipe name'),
        newDescription: z.string().optional().describe('New recipe description'),
        newNotes: z.string().optional().describe('New recipe notes'),
        newPrepMinutes: z.number().optional().describe('New prep time in minutes'),
        newCookMinutes: z.number().optional().describe('New cook time in minutes'),
        newIngredients: z.array(z.string()).optional().describe('Complete list of ingredients (replaces existing)'),
        newInstructions: z.array(z.string()).optional().describe('Complete list of instructions (replaces existing)')
      }),
      async execute({ recipeId: id, newName, newDescription, newNotes, newPrepMinutes, newCookMinutes, newIngredients, newInstructions }) {
        const recipesAccess = new RecipesAccess(prisma)
        const recipe = await recipesAccess.getRecipeById(id)
        if (!recipe) {
          return { success: false, error: 'Recipe not found' }
        }

        const data: Record<string, unknown> = {}
        if (newName && newName !== recipe.name) {
          data.name = newName
          data.slug = slugify(newName)
        }
        if (newDescription && newDescription !== recipe.description) {
          data.description = newDescription
        }
        if (newNotes !== undefined) {
          data.notes = newNotes
        }
        if (newPrepMinutes !== undefined && newPrepMinutes !== recipe.prepMinutes) {
          data.prepMinutes = newPrepMinutes
        }
        if (newCookMinutes !== undefined && newCookMinutes !== recipe.cookMinutes) {
          data.cookMinutes = newCookMinutes
        }

        if (Object.keys(data).length > 0) {
          await recipesAccess.updateRecipe(id, data)
        }

        if (newIngredients) {
          // Delete all existing ingredients and recreate
          await prisma.ingredient.deleteMany({ where: { recipeId: id } })
          await prisma.ingredient.createMany({
            data: newIngredients.map((ing) => ({
              ...ingredientStringToCreatePayload(ing),
              recipeId: id
            }))
          })
        }

        if (newInstructions) {
          // Delete all existing instructions and recreate
          await prisma.instruction.deleteMany({ where: { recipeId: id } })
          await prisma.instruction.createMany({
            data: newInstructions.map((desc) => ({
              description: desc,
              recipeId: id
            }))
          })
        }

        const updated = await recipesAccess.getRecipeById(id)
        return {
          success: true,
          recipeName: updated?.name ?? recipe.name,
          slug: updated?.slug ?? recipe.slug
        }
      }
    }),
    addNote: tool({
      description: 'Add or update notes on the recipe the user is currently viewing.',
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
