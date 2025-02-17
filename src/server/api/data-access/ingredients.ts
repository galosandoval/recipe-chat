import { PrismaClient } from '@prisma/client'

export class IngredientsDataAccess {
  constructor(private readonly prisma: PrismaClient) {}

  async deleteIngredientsByRecipeId(recipeId: string) {
    return await this.prisma.ingredient.deleteMany({ where: { recipeId } })
  }
}
