import { type Recipe, type Ingredient, type Instruction } from '@prisma/client'
import { recipesDataAccess } from '../data-access/recipes'
import { UpdateRecipe } from '../schemas/recipes'

export async function editRecipe({
  id,
  newIngredients,
  ingredients,
  instructions,
  newInstructions,
  newName,
  name,
  prepTime,
  cookTime,
  newPrepTime,
  newCookTime,
  newDescription,
  newNotes,
  notes,
  description
}: UpdateRecipe) {
  const promises = []

  // Handle recipe fields update
  const data = {} as Partial<Recipe>
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
    promises.push(recipesDataAccess.updateRecipeFields(id, data))
  }

  // Handle ingredients
  const oldIngredientsLength = ingredients.length
  const newIngredientsLength = newIngredients.length

  let ingredientsToUpdateCount = newIngredientsLength
  if (oldIngredientsLength > newIngredientsLength) {
    const deleteCount = oldIngredientsLength - newIngredientsLength
    const start = oldIngredientsLength - deleteCount
    const ingredientsToDelete = ingredients.slice(start).map((i) => i.id)
    promises.push(recipesDataAccess.deleteIngredientsByIds(ingredientsToDelete))
  } else if (oldIngredientsLength < newIngredientsLength) {
    ingredientsToUpdateCount = oldIngredientsLength
    const addCount = newIngredientsLength - oldIngredientsLength
    const start = newIngredientsLength - addCount
    const ingredientsToAdd = newIngredients.slice(start).map((i) => ({
      name: i.name,
      recipeId: id
    }))
    promises.push(recipesDataAccess.createIngredients(ingredientsToAdd))
  }

  // Handle ingredient updates
  for (let i = 0; i < ingredientsToUpdateCount; i++) {
    const oldIngredient = ingredients[i]
    const newIngredient = newIngredients[i]
    if (oldIngredient.name !== newIngredient.name) {
      promises.push(
        recipesDataAccess.updateIngredient(newIngredient.id, {
          name: newIngredient.name
        })
      )
    }
  }

  // Handle instructions
  const oldInstructionsLength = instructions.length
  const newInstructionsLength = newInstructions.length

  let instructionsToUpdateCount = newInstructionsLength
  if (oldInstructionsLength > newInstructionsLength) {
    const deleteCount = oldInstructionsLength - newInstructionsLength
    const start = oldInstructionsLength - deleteCount
    const instructionsToDelete = instructions.slice(start).map((i) => i.id)
    promises.push(
      recipesDataAccess.deleteInstructionsByIds(instructionsToDelete)
    )
  } else if (oldInstructionsLength < newInstructionsLength) {
    instructionsToUpdateCount = oldInstructionsLength
    const addCount = newInstructionsLength - oldInstructionsLength
    const start = newInstructionsLength - addCount
    const instructionsToAdd = newInstructions.slice(start).map((i) => ({
      description: i.description,
      recipeId: id
    }))
    promises.push(recipesDataAccess.createInstructions(instructionsToAdd))
  }

  // Handle instruction updates
  for (let i = 0; i < instructionsToUpdateCount; i++) {
    const oldInstruction = instructions[i]
    const newInstruction = newInstructions[i]
    if (oldInstruction.description !== newInstruction.description) {
      promises.push(
        recipesDataAccess.updateInstruction(newInstruction.id, {
          description: newInstruction.description
        })
      )
    }
  }

  await Promise.all(promises)
  return id
}
