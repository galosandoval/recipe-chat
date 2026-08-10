import { ListsAccess, listsAccess } from '~/server/api/data-access/lists-access'
import { IngredientsAccess } from '~/server/api/data-access/ingredients-access'
import { transaction } from '~/server/api/data-access/data-access'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'

interface IngredientInput {
  id: string
  recipeId?: string | null
}

export async function upsertList(userId: string, ingredientIds: string[]) {
  return listsAccess.upsertList(userId, ingredientIds)
}

export async function getListByUserId(userId: string) {
  return listsAccess.getListByUserId(userId)
}

export async function addIngredientToList(
  userId: string,
  newIngredientName: string,
  newIngredientId: string
) {
  return transaction(async (tx) => {
    const parsed = ingredientStringToCreatePayload(newIngredientName)

    const newIngredient = await new IngredientsAccess(tx).createIngredient({
      id: newIngredientId,
      rawString: parsed.rawString,
      quantity: parsed.quantity,
      unit: parsed.unit,
      unitType: parsed.unitType,
      itemName: parsed.itemName,
      preparation: parsed.preparation,
      checked: false,
      listId: null,
      recipeId: null,
      pantryId: null
    })

    return new ListsAccess(tx).updateList(userId, {
      ingredients: { connect: [{ id: newIngredient.id }] }
    })
  })
}

export async function updateIngredientCheckStatus(
  ingredientId: string,
  checked: boolean
) {
  return listsAccess.updateIngredientChecked(ingredientId, checked)
}

export async function updateManyIngredientsCheckStatus(
  ingredients: { id: string; checked: boolean }[]
) {
  return listsAccess.updateIngredientsChecked(ingredients)
}

/**
 * Persists manually adjusted shopping-list quantities. Used when a user edits a
 * merged line's total: the client scales each contributing ingredient and sends
 * the resulting per-ingredient quantities here.
 */
export async function updateIngredientQuantities(
  ingredients: { id: string; quantity: number }[]
) {
  return listsAccess.updateIngredientQuantities(ingredients)
}

export async function clearCheckedIngredientsFromList(
  ingredients: IngredientInput[],
  userId: string
) {
  return transaction(async (tx) => {
    const lists = new ListsAccess(tx)

    const toDisconnect: IngredientInput[] = []
    const toDelete: IngredientInput[] = []

    for (const ingredient of ingredients) {
      if (ingredient.recipeId) {
        toDisconnect.push(ingredient)
      } else {
        toDelete.push(ingredient)
      }
    }

    if (toDisconnect.length) {
      await lists.updateList(userId, {
        ingredients: { disconnect: toDisconnect.map(({ id }) => ({ id })) }
      })
    }

    if (toDelete.length) {
      await lists.deleteIngredients(toDelete.map(({ id }) => id))
    }
  })
}
