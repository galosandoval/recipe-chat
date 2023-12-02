import { z } from 'zod'
import {
  type Ingredient,
  type Instruction,
  type Prisma,
  type PrismaPromise,
  type Recipe
} from '@prisma/client'
import { TRPCError } from '@trpc/server'
import * as cheerio from 'cheerio'
import { createTRPCRouter, protectedProcedure } from 'server/api/trpc'
import { type LinkedData, updateRecipeSchema } from './interface'

export const recipeRouter = createTRPCRouter({
  recentRecipes: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx?.session?.user.id

    return ctx.prisma.recipe.findMany({
      where: { userId: { equals: userId } },
      orderBy: { lastViewedAt: 'desc' },
      take: 4
    })
  }),

  updateLastViewedAt: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const updatedRecipe = await ctx.prisma.recipe.update({
        where: { id: input },
        data: { lastViewedAt: new Date() }
      })

      return updatedRecipe
    }),

  infiniteRecipes: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50),
        cursor: z.string().nullish(),
        search: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit
      const cursor = input.cursor
      const userId = ctx?.session?.user.id

      const items = await ctx.prisma.recipe.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: {
          userId: { equals: userId },
          name: { contains: input.search, mode: 'insensitive' }
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
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findFirst({
        where: { id: { equals: input.id } },
        include: {
          ingredients: { orderBy: { id: 'asc' } },
          instructions: { orderBy: { id: 'asc' } }
        }
      })
    }),

  byIds: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findMany({ where: { id: { in: input } } })
    }),

  parseRecipeUrl: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const response = await fetch(input)
      const text = await response.text()

      const $ = cheerio.load(text)
      const jsonRaw =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          $("script[type='application/ld+json']")[0] as unknown as {
            children: { data: string }[]
          }
        ).children[0]?.data

      const jsonRawNoSpaces = jsonRaw.replace(/\n/g, '')
      const parsed = JSON.parse(jsonRawNoSpaces) as LinkedData

      if ('@graph' in parsed) {
        const recipeField = parsed['@graph'].find((f) => {
          const field = f['@type']
          if (Array.isArray(field)) {
            const asArray = field.find((f) => f === 'Recipe')
            if (asArray) return true
          }

          if (typeof field === 'string') {
            return field === 'Recipe'
          }

          return false
        })
        if (recipeField) {
          return recipeField
        }

        throw new TRPCError({
          message: 'Did not find linked data in @graph',
          code: 'INTERNAL_SERVER_ERROR',
          cause: parsed
        })
      } else if ('@type' in parsed) {
        const field = parsed['@type']
        if (Array.isArray(field)) {
          const asArray = field.find((f) => f === 'Recipe')
          if (asArray) return parsed
        }

        if (typeof field === 'string') {
          return parsed
        }
      } else if (Array.isArray(parsed)) {
        const recipeField = parsed.find((f) => {
          const field = f['@type']
          if (Array.isArray(field)) {
            const asArray = field.find((f) => f === 'Recipe')
            if (asArray) return true
          }

          if (typeof field === 'string') {
            return field === 'Recipe'
          }

          return false
        })
        if (recipeField) {
          return recipeField
        }
      }
      throw new TRPCError({
        message: 'Did not find linked data',
        code: 'INTERNAL_SERVER_ERROR',
        cause: parsed
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        description: z.string().optional(),
        name: z.string(),
        imgUrl: z.string().optional(),
        author: z.string().optional(),
        address: z.string().optional(),
        ingredients: z.array(z.string()),
        instructions: z.array(z.string()),
        url: z.string().optional(),
        prepTime: z.string().optional(),
        cookTime: z.string().optional(),
        messageId: z.string().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      {
        const { ingredients, instructions, messageId, ...rest } = input

        const newRecipe = await ctx.prisma.recipe.create({
          data: {
            userId: ctx.session?.user.id,
            ...rest,
            instructions: {
              create: instructions.map((i) => ({ description: i }))
            },
            ingredients: {
              create: ingredients.map((i) => ({ name: i }))
            }
          },

          include: {
            ingredients: true,
            instructions: true
          }
        })

        if (messageId && messageId.length > 9 && newRecipe.id) {
          await ctx.prisma.message.update({
            where: { id: messageId },
            data: {
              recipeId: newRecipe.id
            }
          })
        }

        return newRecipe
      }
    }),

  edit: protectedProcedure
    .input(updateRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        newIngredients,
        ingredients,
        instructions,
        newInstructions,
        newName,
        name,
        prepTime,
        cookTime,
        newPrepTime,
        newCookTime,
        newDescription,
        newNotes,
        notes,
        description,
        id
      } = input

      const promiseArr: (
        | PrismaPromise<Prisma.BatchPayload>
        | Prisma.Prisma__RecipeClient<Recipe, never>
      )[] = []

      // recipe fields
      const data = {} as Recipe
      if (newPrepTime && newPrepTime !== prepTime) {
        data.prepTime = newPrepTime
      }
      if (newCookTime && newCookTime !== cookTime) {
        data.cookTime = newCookTime
      }
      if (newDescription && newDescription !== description) {
        data.description = newDescription
      }
      if (newName && newName !== name) {
        data.name = newName
      }

      if (newNotes && newNotes !== notes) {
        data.notes = newNotes
      }

      if (Object.values(data).length) {
        const updatePromise = ctx.prisma.recipe.update({
          where: { id },
          data
        })
        promiseArr.push(updatePromise)
      }

      // ingredients
      const oldIngredientsLength = ingredients.length
      const newIngredientsLength = newIngredients.length

      let ingredientsToUpdateCount = newIngredientsLength
      if (oldIngredientsLength > newIngredientsLength) {
        const deleteCount = oldIngredientsLength - newIngredientsLength
        const start = oldIngredientsLength - deleteCount

        const ingredientsToDelete = ingredients.slice(start).map((i) => i.id)
        const deleteIngredientsPromise = ctx.prisma.ingredient.deleteMany({
          where: { id: { in: ingredientsToDelete } }
        })

        promiseArr.push(deleteIngredientsPromise)
      } else if (oldIngredientsLength < newIngredientsLength) {
        ingredientsToUpdateCount = oldIngredientsLength

        const addCount = newIngredientsLength - oldIngredientsLength
        const start = newIngredientsLength - addCount
        const ingredientsToAdd = newIngredients.slice(start).map((i) => i.name)

        const addIngredientsPromise = ctx.prisma.ingredient.createMany({
          data: ingredientsToAdd.map((i) => ({ name: i, recipeId: input.id }))
        })

        promiseArr.push(addIngredientsPromise)
      }

      const ingredientsToUpdate: Omit<Ingredient, 'checked'>[] = []
      for (let i = 0; i < ingredientsToUpdateCount; i++) {
        const oldIngredient = ingredients[i]
        const newIngredient = newIngredients[i]

        if (oldIngredient.name !== newIngredient.name) {
          ingredientsToUpdate.push({
            id: newIngredient.id,
            name: newIngredient.name,
            recipeId: input.id,
            listId: newIngredient.listId ?? null
          })
        }
      }

      if (ingredientsToUpdate.length) {
        const updatePromises = ingredientsToUpdate.map((i) =>
          ctx.prisma.ingredient.update({
            where: { id: i.id },
            data: { name: i.name }
          })
        )

        await Promise.all(updatePromises)
      }

      // instructions
      const oldInstructionsLength = instructions.length
      const newInstructionsLength = newInstructions.length

      let instructionsToUpdateCount = newInstructionsLength
      if (oldInstructionsLength > newInstructionsLength) {
        const deleteCount = oldInstructionsLength - newInstructionsLength
        const start = oldInstructionsLength - deleteCount

        const instructionsToDelete = instructions.slice(start).map((i) => i.id)
        const deleteInstructionsPromise = ctx.prisma.instruction.deleteMany({
          where: { id: { in: instructionsToDelete } }
        })

        promiseArr.push(deleteInstructionsPromise)
      } else if (oldInstructionsLength < newInstructionsLength) {
        instructionsToUpdateCount = oldInstructionsLength

        const addCount = newInstructionsLength - oldInstructionsLength
        const start = newInstructionsLength - addCount
        const instructionsToAdd = newInstructions
          .slice(start)
          .map((i) => i.description)

        const addInstructionsPromise = ctx.prisma.instruction.createMany({
          data: instructionsToAdd.map((i) => ({
            description: i,
            recipeId: input.id
          }))
        })

        promiseArr.push(addInstructionsPromise)
      }

      const instructionsToUpdate: Instruction[] = []
      for (let i = 0; i < instructionsToUpdateCount; i++) {
        const oldInstruction = instructions[i]
        const newInstruction = newInstructions[i]

        if (oldInstruction.description !== newInstruction.description) {
          instructionsToUpdate.push({
            id: newInstruction.id,
            description: newInstruction.description,
            recipeId: input.id
          })
        }
      }

      if (instructionsToUpdate.length) {
        const updatePromises = instructionsToUpdate.map((i) =>
          ctx.prisma.instruction.update({
            where: { id: i.id },
            data: { description: i.description }
          })
        )

        await Promise.all(updatePromises)
      }

      if (promiseArr.length) {
        await ctx.prisma.$transaction(promiseArr)
      }

      return input.id
    }),

  addNotes: protectedProcedure
    .input(z.object({ notes: z.string().nonempty(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const updatedRecipe = await ctx.prisma.recipe.update({
        where: { id: input.id },
        data: { notes: input.notes }
      })

      if (!updatedRecipe) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe not found'
        })
      }

      return true
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deleteIngredients = ctx.prisma.ingredient.deleteMany({
        where: { recipeId: input.id }
      })

      const deleteInstructions = ctx.prisma.instruction.deleteMany({
        where: {
          recipeId: input.id
        }
      })

      const deleteRecipe = ctx.prisma.recipe.delete({
        where: { id: input.id }
      })

      return ctx.prisma.$transaction([
        deleteIngredients,
        deleteInstructions,
        deleteRecipe
      ])
    })
})
