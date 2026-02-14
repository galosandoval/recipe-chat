import type { PrismaClient } from '@prisma/client'

export async function getAllIngredients(userId: string, prisma: PrismaClient) {
  return prisma.ingredient.findMany({
    where: {
      OR: [{ recipe: { userId } }, { list: { userId } }]
    },
    orderBy: { id: 'asc' }
  })
}
