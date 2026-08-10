import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { del } from '@vercel/blob'
import { recipesAccess } from '~/server/api/data-access/recipes-access'
import {
  createRecipeWithEmbedding,
  deleteRecipe,
  editRecipe
} from '../use-cases/recipes-use-case'
import {
  createRecipeSchema,
  updateRecipeImgUrlSchema,
  updateRecipeSchema
} from '~/schemas/recipes-schema'
import { parseRecipePage, RecipePageParseError } from '~/lib/parse-recipe-page'
import { unsplashApi } from '~/lib/unsplash'

export const recipesRouter = createTRPCRouter({
  recentRecipes: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return recipesAccess.getRecentRecipes(userId)
  }),

  updateLastViewedAt: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const result = await recipesAccess.updateRecipe(input, {
        lastViewedAt: new Date()
      })

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe not found'
        })
      }
      const userId = ctx.session.user.id

      return recipesAccess.getRecentRecipes(userId)
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
      return recipesAccess.getInfiniteRecipes(
        userId,
        limit,
        input.search,
        cursor
      )
    }),

  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return recipesAccess.getRecipeBySlug(input.slug)
    }),

  byIds: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => {
      return recipesAccess.getRecipesByIds(input)
    }),

  parseRecipeUrl: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const response = await fetch(input)
      const html = await response.text()

      try {
        return parseRecipePage(html)
      } catch (error) {
        if (error instanceof RecipePageParseError) {
          throw new TRPCError({
            message: error.message,
            code: 'INTERNAL_SERVER_ERROR',
            cause: error.cause
          })
        }
        throw error
      }
    }),

  create: protectedProcedure
    .input(createRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      return await createRecipeWithEmbedding(input, ctx.session.user.id)
    }),

  save: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await recipesAccess.saveRecipe(input)
    }),

  updateImgUrl: protectedProcedure
    .input(updateRecipeImgUrlSchema)
    .mutation(async ({ input }) => {
      if (input.oldUrl) {
        await del(input.oldUrl)
      }

      const updatedRecipe = await recipesAccess.updateRecipe(input.id, {
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
      return await editRecipe(input, ctx.session.user.id)
    }),

  addNotes: protectedProcedure
    .input(z.object({ notes: z.string(), id: z.string() }))
    .mutation(async ({ input }) => {
      const updatedRecipe = await recipesAccess.updateRecipe(input.id, {
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
    .mutation(async ({ input }) => {
      return await deleteRecipe(input.id)
    }),

  getPhotoFromTitle: protectedProcedure
    .input(z.object({ title: z.string() }))
    .query(async ({ input }) => {
      const photo = await unsplashApi.search.getPhotos({
        query: input.title,
        orientation: 'portrait',
        perPage: 4
      })
      return photo
    }),

  triggerUnsplashDownload: protectedProcedure
    .input(z.object({ downloadLocations: z.string().array() }))
    .mutation(async ({ input }) => {
      await Promise.all(
        input.downloadLocations.map((downloadLocation) =>
          unsplashApi.photos.trackDownload({
            downloadLocation
          })
        )
      )
      // Trigger download event as required by Unsplash API guidelines
      return true
    })
})
