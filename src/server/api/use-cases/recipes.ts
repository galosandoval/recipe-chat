import { type Recipe, type PrismaClient } from '@prisma/client'
import { RecipesDataAccess } from '../data-access/recipes'
import { type UpdateRecipe } from '../schemas/recipes'

export async function editRecipe(recipe: UpdateRecipe, prisma: PrismaClient) {
  const { id, ingredients, newIngredients, instructions, newInstructions } =
    recipe
  return prisma.$transaction(async (tx) => {
    const recipesDataAccess = new RecipesDataAccess(tx as PrismaClient)
    await updateRecipeFields(id, recipe, recipesDataAccess)
    await handleIngredients(id, ingredients, newIngredients, recipesDataAccess)
    await handleInstructions(
      id,
      instructions,
      newInstructions,
      recipesDataAccess
    )
    return id
  })
}

// Helper functions
async function updateRecipeFields(
  id: string,
  recipe: UpdateRecipe,
  recipesDataAccess: RecipesDataAccess
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
    await recipesDataAccess.updateRecipe(id, data)
  }
}

async function handleIngredients(
  id: string,
  ingredients: UpdateRecipe['ingredients'],
  newIngredients: UpdateRecipe['newIngredients'],
  recipesDataAccess: RecipesDataAccess
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
      ingredientsToCreate.map((i) => ({ name: i.name, recipeId: id }))
    )
  }

  const ingredientsToUpdate = newIngredients.filter((n) =>
    ingredients.some((old) => old.id === n.id && old.name !== n.name)
  )

  if (ingredientsToUpdate.length > 0) {
    await recipesDataAccess.updateIngredients(ingredientsToUpdate)
  }
}

async function handleInstructions(
  id: string,
  instructions: UpdateRecipe['instructions'],
  newInstructions: UpdateRecipe['newInstructions'],
  recipesDataAccess: RecipesDataAccess
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
  id: string,
  recipesDataAccess: RecipesDataAccess
) {
  await recipesDataAccess.saveRecipe(id)
}