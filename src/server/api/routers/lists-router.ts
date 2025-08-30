import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  addIngredientToList,
  clearCheckedIngredientsFromList,
  getListByUserId,
  updateIngredientCheckStatus,
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
        input.map((i) => i.id),
        ctx.prisma
      )
    }),

  byUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getListByUserId(input.userId, ctx.prisma)
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
      return addIngredientToList(
        userId,
        input.newIngredientName,
        input.id,
        ctx.prisma
      )
    }),

  check: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        checked: z.boolean()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return updateIngredientCheckStatus(input.id, input.checked, ctx.prisma)
    }),

  checkMany: protectedProcedure
    .input(z.array(z.object({ id: z.string(), checked: z.boolean() })))
    .mutation(async ({ ctx, input }) => {
      const transaction = await updateManyIngredientsCheckStatus(
        input,
        ctx.prisma
      )
      return { count: transaction.length }
    }),

  clear: protectedProcedure
    .input(
      z.array(z.object({ id: z.string(), recipeId: z.string().nullable() }))
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      return clearCheckedIngredientsFromList(input, userId, ctx.prisma)
    })
})
