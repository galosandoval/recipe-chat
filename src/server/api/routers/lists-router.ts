import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  addIngredientToList,
  clearCheckedIngredientsFromList,
  getListByUserId,
  updateIngredientCheckStatus,
  updateIngredientQuantities,
  updateManyIngredientsCheckStatus,
  upsertList
} from '../use-cases/lists-use-case'

export const listsRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string()
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      return upsertList(
        userId,
        input.map((i) => i.id)
      )
    }),

  byUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return getListByUserId(input.userId)
    }),

  add: protectedProcedure
    .input(
      z.object({
        newIngredientName: z.string().min(3).max(50),
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      return addIngredientToList(userId, input.newIngredientName, input.id)
    }),

  check: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        checked: z.boolean()
      })
    )
    .mutation(async ({ input }) => {
      return updateIngredientCheckStatus(input.id, input.checked)
    }),

  checkMany: protectedProcedure
    .input(z.array(z.object({ id: z.string(), checked: z.boolean() })))
    .mutation(async ({ input }) => {
      const transaction = await updateManyIngredientsCheckStatus(input)
      return { count: transaction.length }
    }),

  setQuantities: protectedProcedure
    .input(z.array(z.object({ id: z.string(), quantity: z.number().min(0) })))
    .mutation(async ({ input }) => {
      const transaction = await updateIngredientQuantities(input)
      return { count: transaction.length }
    }),

  clear: protectedProcedure
    .input(
      z.array(z.object({ id: z.string(), recipeId: z.string().nullable() }))
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      return clearCheckedIngredientsFromList(input, userId)
    })
})
