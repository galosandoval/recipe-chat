import { ingredientsAccess } from '~/server/api/data-access/ingredients-access'

export async function getAllIngredients(userId: string) {
  return ingredientsAccess.getAllByUserId(userId)
}
