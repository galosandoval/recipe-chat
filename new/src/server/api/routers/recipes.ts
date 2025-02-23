import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import * as cheerio from 'cheerio'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
	type LinkedData,
	updateRecipeSchema,
	createRecipeSchema,
	updateRecipeImgUrlSchema
} from '~/schemas/recipes'
import { del } from '@vercel/blob'
import { RecipesDataAccess } from '~/server/api/data-access/recipes'
import { MessagesDataAccess } from '~/server/api/data-access/messages'
import { IngredientsDataAccess } from '~/server/api/data-access/ingredients'
import { InstructionsDataAccess } from '~/server/api/data-access/instructions'
import { editRecipe } from '../use-cases/recipes'
import { type PrismaClient } from '@prisma/client'

export const recipesRouter = createTRPCRouter({
	recentRecipes: protectedProcedure.query(async ({ ctx }) => {
		const recipesDataAccess = new RecipesDataAccess(ctx.db)
		const userId = ctx.session.user.id

		return recipesDataAccess.getRecentRecipes(userId)
	}),

	updateLastViewedAt: protectedProcedure
		.input(z.string())
		.mutation(async ({ input, ctx }) => {
			const recipesDataAccess = new RecipesDataAccess(ctx.db)
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
			const recipesDataAccess = new RecipesDataAccess(ctx.db)
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
			const recipesDataAccess = new RecipesDataAccess(ctx.db)
			return recipesDataAccess.getRecipeById(input.id)
		}),

	byIds: protectedProcedure
		.input(z.array(z.string()))
		.query(async ({ input, ctx }) => {
			const recipesDataAccess = new RecipesDataAccess(ctx.db)
			return recipesDataAccess.getRecipesByIds(input)
		}),

	parseRecipeUrl: protectedProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			const response = await fetch(input)
			const text = await response.text()

			const $ = cheerio.load(text)
			const jsonRaw = (
				$("script[type='application/ld+json']")[0] as unknown as {
					children: { data: string }[]
				}
			).children[0]?.data

			const jsonRawNoSpaces = jsonRaw?.replace(/\n/g, '')
			const parsed = JSON.parse(jsonRawNoSpaces ?? '') as LinkedData

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
			const { messageId, ...rest } = input
			const recipesDataAccess = new RecipesDataAccess(ctx.db)
			const messagesDataAccess = new MessagesDataAccess(ctx.db)

			const newRecipe = await recipesDataAccess.createRecipe(
				rest,
				ctx.session.user.id
			)

			if (messageId && messageId.length > 9 && newRecipe.id) {
				await messagesDataAccess.updateMessage(messageId, {
					recipeId: newRecipe.id
				})
			}

			return newRecipe
		}),

	updateImgUrl: protectedProcedure
		.input(updateRecipeImgUrlSchema)
		.mutation(async ({ input, ctx }) => {
			const recipesDataAccess = new RecipesDataAccess(ctx.db)

			if (input.oldUrl) {
				await del(input.oldUrl)
			}

			const updatedRecipe = await recipesDataAccess.updateRecipe(
				input.id,
				{
					imgUrl: input.imgUrl
				}
			)

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
			return await editRecipe(input, ctx.db)
		}),

	addNotes: protectedProcedure
		.input(z.object({ notes: z.string().nonempty(), id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const recipesDataAccess = new RecipesDataAccess(ctx.db)
			const updatedRecipe = await recipesDataAccess.updateRecipe(
				input.id,
				{
					notes: input.notes
				}
			)

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
			return await ctx.db.$transaction(async (prisma) => {
				const recipesDataAccess = new RecipesDataAccess(
					prisma as PrismaClient
				)
				const ingredientsDataAccess = new IngredientsDataAccess(
					prisma as PrismaClient
				)
				const instructionsDataAccess = new InstructionsDataAccess(
					prisma as PrismaClient
				)

				const deleteIngredients =
					ingredientsDataAccess.deleteIngredientsByRecipeId(input.id)

				const deleteInstructions =
					instructionsDataAccess.deleteInstructionsByRecipeId(
						input.id
					)

				const deleteRecipe = recipesDataAccess.deleteRecipeById(
					input.id
				)

				await deleteIngredients
				await deleteInstructions
				await deleteRecipe
				return true
			})
		})
})
