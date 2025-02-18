import { Ingredient, PrismaClient } from '@prisma/client'

export class IngredientsDataAccess {
  constructor(private readonly prisma: PrismaClient) {}

  async createIngredient(input: Ingredient) {
    return await this.prisma.ingredient.create({ data: input })
  }

  async deleteIngredientsByRecipeId(recipeId: string) {
    return await this.prisma.ingredient.deleteMany({ where: { recipeId } })
  }
}
