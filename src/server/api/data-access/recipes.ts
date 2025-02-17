import { prisma } from '~/server/db'
import { CreateRecipe, UpdateRecipe } from '../schemas/recipes'
import { Prisma, PrismaClient, Recipe } from '@prisma/client'

class RecipesDataAccess {
  constructor(readonly prisma: PrismaClient) {}

  async getRecipeById(id: string) {
    return await this.prisma.recipe.findFirst({
      where: { id: { equals: id } },
      include: {
        ingredients: { orderBy: { id: 'asc' } },
        instructions: { orderBy: { id: 'asc' } }
      }
    })
  }

  async getRecipesByIds(ids: string[]) {
    return await this.prisma.recipe.findMany({
      where: { id: { in: ids } }
    })
  }

  async getRecentRecipes(userId: string) {
    return await this.prisma.recipe.findMany({
      where: { userId: { equals: userId } },
      orderBy: { lastViewedAt: 'desc' },
      take: 4
    })
  }

  async updateLastViewedAt(recipeId: string) {
    return await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { lastViewedAt: new Date() }
    })
  }

  async getInfiniteRecipes(
    userId: string,
    limit: number,
    search: string,
    cursor?: string | null
  ) {
    const items = await this.prisma.recipe.findMany({
      take: limit + 1, // get an extra item at the end which we'll use as next cursor
      where: {
        userId: { equals: userId },
        name: { contains: search, mode: 'insensitive' }
      },
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        name: 'asc'
      }
    })
    let nextCursor: typeof cursor | undefined = undefined
    if (items.length > limit) {
      const nextItem = items.pop()
      nextCursor = nextItem?.id
    }
    return {
      items,
      nextCursor
    }
  }

  async createRecipe(recipe: Omit<CreateRecipe, 'messsageId'>, userId: string) {
    return await prisma.recipe.create({
      data: {
        ...recipe,
        userId,
        instructions: {
          create: recipe.instructions.map((i) => ({ description: i }))
        },
        ingredients: {
          create: recipe.ingredients.map((i) => ({ name: i }))
        }
      },
      include: {
        ingredients: true,
        instructions: true
      }
    })
  }

  async updateRecipeImgUrl(id: string, imgUrl: string) {
    return await prisma.recipe.update({
      where: { id },
      data: { imgUrl }
    })
  }

  async updateRecipeNotes(id: string, notes: string) {
    return await prisma.recipe.update({
      where: { id },
      data: { notes }
    })
  }

  async deleteRecipeById(id: string) {
    return await this.prisma.recipe.delete({
      where: { id }
    })
  }

  async updateRecipeFields(
    id: string,
    data: Partial<Recipe>,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma
    return await client.recipe.update({
      where: { id },
      data
    })
  }

  async deleteIngredientsByIds(ids: string[], tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma
    return await client.ingredient.deleteMany({
      where: { id: { in: ids } }
    })
  }

  async createIngredients(
    ingredients: { name: string; recipeId: string }[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma
    return await client.ingredient.createMany({
      data: ingredients
    })
  }

  async updateIngredients(
    ingredients: { id: string; name: string }[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma
    return Promise.all(
      ingredients.map((ingredient) =>
        client.ingredient.update({
          where: { id: ingredient.id },
          data: { name: ingredient.name }
        })
      )
    )
  }

  async deleteInstructionsByIds(ids: string[], tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma
    return await client.instruction.deleteMany({
      where: { id: { in: ids } }
    })
  }

  async createInstructions(
    instructions: { description: string; recipeId: string }[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma
    return await client.instruction.createMany({
      data: instructions
    })
  }

  async updateInstructions(
    instructions: { id: string; description: string }[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma
    return Promise.all(
      instructions.map((instruction) =>
        client.instruction.update({
          where: { id: instruction.id },
          data: { description: instruction.description }
        })
      )
    )
  }
}

export const recipesDataAccess = new RecipesDataAccess(prisma)
