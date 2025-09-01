import type { Ingredient, Instruction } from '@prisma/client'
import type {
  EditRecipeFormValues,
  RecipeToEdit,
  UpdateRecipe
} from '~/schemas/recipes-schema'

export const submitEditRecipe =
  (
    ingredients: Ingredient[],
    instructions: Instruction[],
    recipe: RecipeToEdit,
    editRecipe: (recipe: UpdateRecipe) => void
  ) =>
  (values: EditRecipeFormValues) => {
    const { name, description, cookMinutes, prepMinutes, notes } = recipe
    const newIngredients = values.ingredients
      .split('\n')
      .filter((i) => i.length > 2)
    const oldIngredients = [...ingredients]

    const maxIngredientsLength = Math.max(
      newIngredients.length,
      oldIngredients.length
    )
    const ingredientsToChange: { id: string; name: string; listId?: string }[] =
      []

    for (let i = 0; i < maxIngredientsLength; i++) {
      const newIngredient = newIngredients[i]
      const oldIngredient = oldIngredients[i]

      if (!!newIngredient) {
        const changedIngredient = {
          id: oldIngredient?.id || '',
          name: newIngredient || '',
          listId: oldIngredient?.listId || undefined
        }
        ingredientsToChange.push(changedIngredient)
      }
    }

    const newInstructions = values.instructions.split('\n')
    const oldInstructions = [...instructions]

    const maxInstructionLength = Math.max(
      newInstructions.length,
      oldInstructions.length
    )

    const instructionsToChange: { id: string; description: string }[] = []

    for (let i = 0; i < maxInstructionLength; i++) {
      const newInstruction = newInstructions[i]
      const oldInstruction = oldInstructions[i]

      if (!!newInstruction) {
        instructionsToChange.push({
          id: oldInstruction?.id || '',
          description: newInstruction || ''
        })
      }
    }

    const params: Partial<UpdateRecipe> = { id: recipe.id }
    if (name !== values.name) {
      params.name = values.name
    }
    if (description !== values.description) {
      params.description = values.description
    }

    editRecipe({
      newIngredients: ingredientsToChange,
      newName: values.name,
      newDescription: values.description,
      id: recipe.id,
      newInstructions: instructionsToChange,
      ingredients: oldIngredients,
      instructions: oldInstructions,
      newCookMinutes: values.cookMinutes,
      newPrepMinutes: values.prepMinutes,
      cookMinutes: cookMinutes || undefined,
      prepMinutes: prepMinutes || undefined,
      name: name || '',
      description: description || '',
      notes,
      newNotes: values.notes
    })
  }
