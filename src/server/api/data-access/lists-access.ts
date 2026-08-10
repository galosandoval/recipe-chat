import { type List, type PrismaClient } from '@prisma/client'
import { DataAccess } from './data-access'

export class ListsAccess extends DataAccess {
  async upsertList(userId: string, ingredientIds: string[]): Promise<List> {
    return this.prisma.list.upsert({
      where: { userId },
      create: {
        userId,
        ingredients: { connect: ingredientIds.map((id) => ({ id })) }
      },
      update: { ingredients: { connect: ingredientIds.map((id) => ({ id })) } }
    })
  }

  async getListByUserId(userId: string) {
    return this.prisma.list.findFirst({
      where: { userId: { equals: userId } },
      select: { ingredients: { orderBy: { id: 'asc' } } }
    })
  }

  async updateList(
    userId: string,
    data: {
      ingredients: { connect?: { id: string }[]; disconnect?: { id: string }[] }
    }
  ) {
    return this.prisma.list.update({
      where: { userId },
      data
    })
  }

  async deleteIngredients(ingredientIds: string[]) {
    await this.prisma.ingredient.deleteMany({
      where: { id: { in: ingredientIds } }
    })
  }

  async updateIngredientChecked(ingredientId: string, checked: boolean) {
    return this.prisma.ingredient.update({
      where: { id: ingredientId },
      data: { checked }
    })
  }

  /** Check/uncheck many lines atomically, so a partial write can't leave the list half-toggled. */
  async updateIngredientsChecked(
    ingredients: { id: string; checked: boolean }[]
  ) {
    return (this.prisma as PrismaClient).$transaction(
      ingredients.map(({ id, checked }) =>
        this.prisma.ingredient.update({ where: { id }, data: { checked } })
      )
    )
  }

  /**
   * Persists manually adjusted quantities atomically. Used when a user edits a
   * merged line's total: the client scales each contributing ingredient and
   * sends the resulting per-ingredient quantities.
   */
  async updateIngredientQuantities(
    ingredients: { id: string; quantity: number }[]
  ) {
    return (this.prisma as PrismaClient).$transaction(
      ingredients.map(({ id, quantity }) =>
        this.prisma.ingredient.update({ where: { id }, data: { quantity } })
      )
    )
  }
}

export const listsAccess = new ListsAccess()
