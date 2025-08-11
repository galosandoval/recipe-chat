import { type Ingredient } from '@prisma/client'
import { DataAccess } from './data-access'

export class IngredientsAccess extends DataAccess {
  async createIngredient(input: Ingredient) {
    return await this.prisma.ingredient.create({ data: input })
  }

  async deleteIngredientsByRecipeId(recipeId: string) {
    return await this.prisma.ingredient.deleteMany({ where: { recipeId } })
  }
}
