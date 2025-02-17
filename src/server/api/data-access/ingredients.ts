import { PrismaClient } from '@prisma/client'
import { prisma } from '~/server/db'

class IngredientsDataAccess {
  constructor(readonly prisma: PrismaClient) {}

  async deleteIngredientsByRecipeId(recipeId: string) {
    return await this.prisma.ingredient.deleteMany({ where: { recipeId } })
  }
}

export const ingredientsDataAccess = new IngredientsDataAccess(prisma)
