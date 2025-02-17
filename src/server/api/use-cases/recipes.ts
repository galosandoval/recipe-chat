import { type Prisma, type Recipe } from '@prisma/client'
import { recipesDataAccess } from '../data-access/recipes'
import { UpdateRecipe } from '../schemas/recipes'
import { prisma } from '~/server/db'

export async function editRecipe(recipe: UpdateRecipe) {
  const { id, ingredients, newIngredients, instructions, newInstructions } =
    recipe

  return prisma.$transaction(async (tx) => {
    await updateRecipeFields(id, recipe, tx)
    await handleIngredients(id, ingredients, newIngredients, tx)
    await handleInstructions(id, instructions, newInstructions, tx)
    return id
  })
}

// Helper functions
async function updateRecipeFields(
  id: string,
  recipe: UpdateRecipe,
  tx: Prisma.TransactionClient
) {
  const data = {} as Partial<Recipe>
  const {
    newPrepTime,
    prepTime,
    newCookTime,
    cookTime,
    newDescription,
    description,
    newName,
    name,
    newNotes,
    notes
  } = recipe

  if (newPrepTime && newPrepTime !== prepTime) {
    data.prepTime = newPrepTime
  }
  if (newCookTime && newCookTime !== cookTime) {
    data.cookTime = newCookTime
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
    await recipesDataAccess.updateRecipeFields(id, data, tx)
  }
}

async function handleIngredients(
  id: string,
  ingredients: UpdateRecipe['ingredients'],
  newIngredients: UpdateRecipe['newIngredients'],
  tx: Prisma.TransactionClient
) {
  const ingredientsToDelete = ingredients.filter(
    (old) => !newIngredients.some((n) => n.id === old.id)
  )
  if (ingredientsToDelete.length > 0) {
    await recipesDataAccess.deleteIngredientsByIds(
      ingredientsToDelete.map((i) => i.id),
      tx
    )
  }

  const ingredientsToCreate = newIngredients.filter((n) => n.id === '')
  if (ingredientsToCreate.length > 0) {
    await recipesDataAccess.createIngredients(
      ingredientsToCreate.map((i) => ({ name: i.name, recipeId: id })),
      tx
    )
  }

  const ingredientsToUpdate = newIngredients.filter((n) =>
    ingredients.some((old) => old.id === n.id && old.name !== n.name)
  )

  if (ingredientsToUpdate.length > 0) {
    await recipesDataAccess.updateIngredients(ingredientsToUpdate, tx)
  }
}

async function handleInstructions(
  id: string,
  instructions: UpdateRecipe['instructions'],
  newInstructions: UpdateRecipe['newInstructions'],
  tx: Prisma.TransactionClient
) {
  // Delete instructions that no longer exist
  const instructionsToDelete = instructions.filter(
    (old) => !newInstructions.some((n) => n.id === old.id)
  )
  if (instructionsToDelete.length > 0) {
    await recipesDataAccess.deleteInstructionsByIds(
      instructionsToDelete.map((i) => i.id),
      tx
    )
  }

  // Create instructions that are new
  const instructionsToCreate = newInstructions.filter((n) => n.id === '')
  if (instructionsToCreate.length > 0) {
    await recipesDataAccess.createInstructions(
      instructionsToCreate.map((i) => ({
        description: i.description,
        recipeId: id
      })),
      tx
    )
  }

  // Update instructions
  const instructionsToUpdate = newInstructions.filter((n) =>
    instructions.some(
      (old) => old.id === n.id && old.description !== n.description
    )
  )

  if (instructionsToUpdate.length > 0) {
    await recipesDataAccess.updateInstructions(instructionsToUpdate, tx)
  }
}
