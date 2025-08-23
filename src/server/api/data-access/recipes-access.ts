import { prisma } from '~/server/db'
import { type CreateRecipe } from '../schemas/recipes'
import { type Prisma, type Recipe } from '@prisma/client'
import { DataAccess } from './data-access'

export class RecipesAccess extends DataAccess {
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
      where: { userId: { equals: userId }, saved: { equals: true } },
      orderBy: { lastViewedAt: 'desc' },
      take: 4
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
        name: { contains: search, mode: 'insensitive' },
        saved: { equals: true }
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

  async saveRecipe({ id }: { id: string }) {
    return await this.prisma.recipe.update({
      where: { id },
      data: {
        saved: { set: true }
      }
    })
  }

  async createRecipe(recipe: Omit<CreateRecipe, 'messsageId'>, userId: string) {
    return await prisma.recipe.create({
      data: {
        ...recipe,
        user: { connect: { id: userId } },
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

  async deleteRecipeById(id: string) {
    return await this.prisma.recipe.delete({
      where: { id }
    })
  }

  async updateRecipe(id: string, data: Partial<Recipe>) {
    return await this.prisma.recipe.update({
      where: { id },
      data
    })
  }

  /**
   * Updates a recipe with new ingredients and instructions, creating them in the process
   * @param id - The recipe ID to update
   * @param data - The recipe data including ingredients and instructions arrays
   * @param tx - Optional transaction client for database operations
   */
  async updateRecipeWithIngredientsAndInstructions(
    id: string,
    data: {
      ingredients: string[]
      instructions: string[]
      prepMinutes?: number
      cookMinutes?: number
    }
  ) {
    return await this.prisma.recipe.update({
      where: { id },
      data: {
        ...data,
        ingredients: {
          create: data.ingredients.map((ingredient) => ({
            name: ingredient
          }))
        },
        instructions: {
          create: data.instructions.map((instruction) => ({
            description: instruction
          }))
        }
      }
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
    instructions: { description: string; recipeId: string }[]
  ) {
    return await this.prisma.instruction.createMany({
      data: instructions
    })
  }

  async updateInstructions(
    instructions: { id: string; description: string }[]
  ) {
    return Promise.all(
      instructions.map((instruction) =>
        this.prisma.instruction.update({
          where: { id: instruction.id },
          data: { description: instruction.description }
        })
      )
    )
  }
}
