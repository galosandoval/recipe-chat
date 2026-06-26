import { prisma } from '~/server/db'
import { type Prisma, type Recipe } from '@prisma/client'
import { DataAccess } from './data-access'
import type { CreateRecipe, RecipeWriteInput } from '~/schemas/recipes-schema'
import { toRecipeWriteData } from '~/schemas/recipes-schema'
import { slugify } from '~/lib/utils'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'

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

  async getRecipeBySlug(slug: string) {
    return await this.prisma.recipe.findFirst({
      where: { slug: { equals: slug } },
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

  async getRecipeNamesByUserId(userId: string, limit = 50) {
    const recipes = await this.prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { name: true }
    })
    return recipes.map((r) => r.name)
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
        name: recipe.name,
        slug: slugify(recipe.name),
        ...toRecipeWriteData(recipe),
        user: { connect: { id: userId } },
        instructions: {
          create: recipe.instructions.map((i) => ({ description: i }))
        },
        ingredients: {
          create: recipe.ingredients.map((i) =>
            ingredientStringToCreatePayload(i)
          )
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
    } & RecipeWriteInput
  ) {
    const { ingredients, instructions, ...rest } = data
    return await this.prisma.recipe.update({
      where: { id },
      data: {
        ...toRecipeWriteData(rest),
        ingredients: {
          deleteMany: {},
          create: ingredients.map((line) =>
            ingredientStringToCreatePayload(line)
          )
        },
        instructions: {
          deleteMany: {},
          create: instructions.map((instruction) => ({
            description: instruction
          }))
        }
      }
    })
  }

  async upsertRecipeWithIngredientsAndInstructions(
    id: string,
    data: {
      name: string
      userId: string
      ingredients: string[]
      instructions: string[]
    } & RecipeWriteInput
  ) {
    const { ingredients, instructions, name, userId, ...rest } = data
    const writeData = toRecipeWriteData(rest)
    const ingredientData = ingredients.map((line) =>
      ingredientStringToCreatePayload(line)
    )
    const instructionData = instructions.map((instruction) => ({
      description: instruction
    }))

    return await this.prisma.recipe.upsert({
      where: { id },
      update: {
        ...writeData,
        ingredients: { deleteMany: {}, create: ingredientData },
        instructions: { deleteMany: {}, create: instructionData }
      },
      create: {
        id,
        name,
        slug: slugify(name),
        ...writeData,
        user: { connect: { id: userId } },
        ingredients: { create: ingredientData },
        instructions: { create: instructionData }
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
    ingredients: {
      recipeId: string
      rawString: string
      quantity?: number | null
      unit?: string | null
      unitType?: 'volume' | 'weight' | 'count' | null
      itemName?: string | null
      preparation?: string | null
    }[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma
    return await client.ingredient.createMany({
      data: ingredients
    })
  }

  async updateIngredients(
    ingredients: {
      id: string
      rawString: string
      quantity?: number | null
      unit?: string | null
      unitType?: 'volume' | 'weight' | 'count' | null
      itemName?: string | null
      preparation?: string | null
    }[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma
    return Promise.all(
      ingredients.map((ingredient) => {
        const { id, ...data } = ingredient
        return client.ingredient.update({
          where: { id },
          data
        })
      })
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
