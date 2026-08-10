import { type Ingredient } from '@prisma/client'
import { DataAccess } from './data-access'

export class IngredientsAccess extends DataAccess {
  async createIngredient(input: Ingredient) {
    return await this.prisma.ingredient.create({ data: input })
  }

  /**
   * Every ingredient a user owns, from either side it can hang off: a recipe
   * they saved or their shopping list.
   */
  async getAllByUserId(userId: string) {
    return await this.prisma.ingredient.findMany({
      where: { OR: [{ recipe: { userId } }, { list: { userId } }] },
      orderBy: { id: 'asc' }
    })
  }

  async deleteIngredientsByRecipeId(recipeId: string) {
    return await this.prisma.ingredient.deleteMany({ where: { recipeId } })
  }
}

export const ingredientsAccess = new IngredientsAccess()
