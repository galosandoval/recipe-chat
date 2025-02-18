import { type PrismaClient, type List } from '@prisma/client'

export class ListDataAccess {
  constructor(private readonly prisma: PrismaClient) {}

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
}
