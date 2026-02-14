import { type Recipe, type PrismaClient } from '@prisma/client'
import { RecipesAccess } from '../data-access/recipes-access'
import type { UpdateRecipe } from '~/schemas/recipes-schema'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'

export async function editRecipe(recipe: UpdateRecipe, prisma: PrismaClient) {
  const { id, ingredients, newIngredients, instructions, newInstructions } =
    recipe
  return prisma.$transaction(async (tx) => {
    const recipesDataAccess = new RecipesAccess(tx as PrismaClient)
    await updateRecipeFields(id, recipe, recipesDataAccess)
    await handleIngredients(id, ingredients, newIngredients, recipesDataAccess)
    await handleInstructions(
      id,
      instructions,
      newInstructions,
      recipesDataAccess
    )
    const foundRecipe = await recipesDataAccess.getRecipeById(id)
    if (!foundRecipe) {
      throw new Error('Recipe not found')
    }
    return foundRecipe.slug
  })
}

// Helper functions
async function updateRecipeFields(
  id: string,
  recipe: UpdateRecipe,
  recipesDataAccess: RecipesAccess
) {
  const data = {} as Partial<Recipe>
  const {
    newPrepMinutes,
    prepMinutes,
    newCookMinutes,
    cookMinutes,
    newDescription,
    description,
    newName,
    name,
    newNotes,
    notes
  } = recipe

  if (newPrepMinutes && newPrepMinutes !== prepMinutes) {
    data.prepMinutes = newPrepMinutes
  }
  if (newCookMinutes && newCookMinutes !== cookMinutes) {
    data.cookMinutes = newCookMinutes
  }
  if (newDescription && newDescription !== description) {
    data.description = newDescription
  }
  if (newName && newName !== name) {
    data.name = newName
  }
  if (newNotes && newNotes !== notes) {
    data.notes = newNotes
  }

  if (Object.keys(data).length > 0) {
    await recipesDataAccess.updateRecipe(id, data)
  }
}

async function handleIngredients(
  id: string,
  ingredients: UpdateRecipe['ingredients'],
  newIngredients: UpdateRecipe['newIngredients'],
  recipesDataAccess: RecipesAccess
) {
  const ingredientsToDelete = ingredients.filter(
    (old) => !newIngredients.some((n) => n.id === old.id)
  )
  if (ingredientsToDelete.length > 0) {
    await recipesDataAccess.deleteIngredientsByIds(
      ingredientsToDelete.map((i) => i.id)
    )
  }

  const ingredientsToCreate = newIngredients.filter((n) => n.id === '')
  if (ingredientsToCreate.length > 0) {
    await recipesDataAccess.createIngredients(
      ingredientsToCreate.map((i) => ({
        ...ingredientStringToCreatePayload(i.name),
        recipeId: id
      }))
    )
  }

  const ingredientsToUpdate = newIngredients.filter((n) =>
    ingredients.some((old) => old.id === n.id && old.name !== n.name)
  )

  if (ingredientsToUpdate.length > 0) {
    await recipesDataAccess.updateIngredients(
      ingredientsToUpdate.map((i) => ({
        id: i.id,
        name: i.name,
        ...ingredientStringToCreatePayload(i.name)
      }))
    )
  }
}

async function handleInstructions(
  id: string,
  instructions: UpdateRecipe['instructions'],
  newInstructions: UpdateRecipe['newInstructions'],
  recipesDataAccess: RecipesAccess
) {
  // Delete instructions that no longer exist
  const instructionsToDelete = instructions.filter(
    (old) => !newInstructions.some((n) => n.id === old.id)
  )
  if (instructionsToDelete.length > 0) {
    await recipesDataAccess.deleteInstructionsByIds(
      instructionsToDelete.map((i) => i.id)
    )
  }

  // Create instructions that are new
  const instructionsToCreate = newInstructions.filter((n) => n.id === '')
  if (instructionsToCreate.length > 0) {
    await recipesDataAccess.createInstructions(
      instructionsToCreate.map((i) => ({
        description: i.description,
        recipeId: id
      }))
    )
  }

  // Update instructions
  const instructionsToUpdate = newInstructions.filter((n) =>
    instructions.some(
      (old) => old.id === n.id && old.description !== n.description
    )
  )

  if (instructionsToUpdate.length > 0) {
    await recipesDataAccess.updateInstructions(instructionsToUpdate)
  }
}

export async function saveRecipe(
  data: {
    id: string
  },
  recipesDataAccess: RecipesAccess
) {
  await recipesDataAccess.saveRecipe(data)
}
