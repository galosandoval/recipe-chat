import type { RecipeToEdit, UpdateRecipe } from '~/schemas/recipes-schema'
import { getIngredientDisplayText } from '~/lib/ingredient-display'

/**
 * The subset of {@link UpdateRecipe} the chat editRecipe tool can express. The
 * assistant replaces ingredients/instructions wholesale (plain strings), while
 * the use-case works in a selective id-diff — {@link toEditRecipeInput} bridges
 * the two.
 */
export type ChatRecipeEdits = {
  newName?: string
  newDescription?: string
  newNotes?: string
  newPrepMinutes?: number
  newCookMinutes?: number
  newIngredients?: string[]
  newInstructions?: string[]
}

/**
 * Map the chat tool's parameters onto the editRecipe use-case's input. The old
 * ingredient/instruction rows are handed back as-is so an assistant "replace the
 * whole list" edit reduces to the use-case's diff: every existing row has no
 * match among the new (id-less) rows, so all are deleted and the new ones
 * created — reproducing the old delete-and-recreate through the shared path.
 *
 * When the tool leaves ingredients/instructions untouched, both sides are empty
 * so the diff writes nothing (never mistakenly clearing the list).
 */
export function toEditRecipeInput(
  recipe: RecipeToEdit,
  edits: ChatRecipeEdits
): UpdateRecipe {
  const replacingIngredients = edits.newIngredients !== undefined
  const replacingInstructions = edits.newInstructions !== undefined

  return {
    id: recipe.id,
    // Current values feed the use-case's changed-field diff.
    name: recipe.name,
    description: recipe.description ?? undefined,
    prepMinutes: recipe.prepMinutes ?? undefined,
    cookMinutes: recipe.cookMinutes ?? undefined,
    notes: recipe.notes ?? undefined,
    // newName is required by the schema; echo the current name when the tool
    // did not rename, so the diff sees no change.
    newName: edits.newName ?? recipe.name,
    newDescription: edits.newDescription,
    newNotes: edits.newNotes,
    newPrepMinutes: edits.newPrepMinutes,
    newCookMinutes: edits.newCookMinutes,
    ingredients: replacingIngredients
      ? recipe.ingredients.map((ingredient) => ({
          id: ingredient.id,
          rawString: getIngredientDisplayText(ingredient),
          listId: ingredient.listId,
          recipeId: ingredient.recipeId
        }))
      : [],
    newIngredients: replacingIngredients
      ? edits.newIngredients!.map((name) => ({ id: '', name }))
      : [],
    instructions: replacingInstructions
      ? recipe.instructions.map((instruction) => ({
          id: instruction.id,
          description: instruction.description,
          recipeId: instruction.recipeId
        }))
      : [],
    newInstructions: replacingInstructions
      ? edits.newInstructions!.map((description) => ({ id: '', description }))
      : []
  }
}
