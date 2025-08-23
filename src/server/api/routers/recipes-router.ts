import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import * as cheerio from 'cheerio'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  type LinkedData,
  updateRecipeSchema,
  createRecipeSchema,
  updateRecipeImgUrlSchema
} from '~/server/api/schemas/recipes'
import { del } from '@vercel/blob'
import { RecipesAccess } from '~/server/api/data-access/recipes-access'
import { IngredientsAccess } from '~/server/api/data-access/ingredients-access'
import { InstructionsAccess } from '~/server/api/data-access/instructions-access'
import { editRecipe, saveRecipe } from '../use-cases/recipes'
import { type PrismaClient } from '@prisma/client'
import { RecipesOnMessagesAccess } from '../data-access/recipes-on-messages-access'

export const recipesRouter = createTRPCRouter({
  recentRecipes: protectedProcedure.query(async ({ ctx }) => {
    const recipesDataAccess = new RecipesAccess(ctx.prisma)
    const userId = ctx.session.user.id

    return recipesDataAccess.getRecentRecipes(userId)
  }),

  updateLastViewedAt: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const recipesDataAccess = new RecipesAccess(ctx.prisma)
      return recipesDataAccess.updateRecipe(input, {
        lastViewedAt: new Date()
      })
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
      const recipesDataAccess = new RecipesAccess(ctx.prisma)
      return recipesDataAccess.getInfiniteRecipes(
        userId,
        limit,
        input.search,
        cursor
      )
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const recipesDataAccess = new RecipesAccess(ctx.prisma)
      return recipesDataAccess.getRecipeById(input.id)
    }),

  byIds: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input, ctx }) => {
      const recipesDataAccess = new RecipesAccess(ctx.prisma)
      return recipesDataAccess.getRecipesByIds(input)
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
    .input(createRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      const recipesDataAccess = new RecipesAccess(ctx.prisma)

      const newRecipe = await recipesDataAccess.createRecipe(
        input,
        ctx.session.user.id
      )

      // The recipe is already linked to the message via the messageId field
      // No need to update the message object

      return newRecipe
    }),

  save: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const recipesDataAccess = new RecipesAccess(ctx.prisma)
      return await saveRecipe(input, recipesDataAccess)
    }),

  updateImgUrl: protectedProcedure
    .input(updateRecipeImgUrlSchema)
    .mutation(async ({ input, ctx }) => {
      const recipesDataAccess = new RecipesAccess(ctx.prisma)

      if (input.oldUrl) {
        await del(input.oldUrl)
      }

      const updatedRecipe = await recipesDataAccess.updateRecipe(input.id, {
        imgUrl: input.imgUrl
      })

      if (!updatedRecipe) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe not found'
        })
      }

      return true
    }),

  edit: protectedProcedure
    .input(updateRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      return await editRecipe(input, ctx.prisma)
    }),

  addNotes: protectedProcedure
    .input(z.object({ notes: z.string().nonempty(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const recipesDataAccess = new RecipesAccess(ctx.prisma)
      const updatedRecipe = await recipesDataAccess.updateRecipe(input.id, {
        notes: input.notes
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
      return await ctx.prisma.$transaction(async (prisma) => {
        const recipesDataAccess = new RecipesAccess(prisma as PrismaClient)
        const ingredientsDataAccess = new IngredientsAccess(
          prisma as PrismaClient
        )
        const instructionsDataAccess = new InstructionsAccess(
          prisma as PrismaClient
        )
        const recipesOnMessagesDataAccess = new RecipesOnMessagesAccess(
          prisma as PrismaClient
        )
        const deleteIngredients =
          ingredientsDataAccess.deleteIngredientsByRecipeId(input.id)

        const deleteInstructions =
          instructionsDataAccess.deleteInstructionsByRecipeId(input.id)

        const deleteRecipesOnMessages =
          recipesOnMessagesDataAccess.deleteByRecipeId(input.id)

        const deleteRecipe = recipesDataAccess.deleteRecipeById(input.id)

        await deleteIngredients
        await deleteInstructions
        await deleteRecipesOnMessages
        await deleteRecipe
        return true
      })
    })
})
