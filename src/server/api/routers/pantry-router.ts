import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  addIngredientToPantry,
  bulkAddToPantry,
  deletePantryIngredient,
  getPantryByUserId,
  updatePantryIngredient
} from '../use-cases/pantry-use-case'

export const pantryRouter = createTRPCRouter({
  byUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getPantryByUserId(input.userId, ctx.prisma)
    }),

  add: protectedProcedure
    .input(
      z.object({
        rawLine: z.string().min(1).max(500),
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      return addIngredientToPantry(
        userId,
        input.rawLine,
        input.id,
        ctx.prisma
      )
    }),

  update: protectedProcedure
    .input(
      z.object({
        ingredientId: z.string(),
        data: z.object({
          rawString: z.string().optional(),
          quantity: z.number().nullable().optional(),
          unit: z.string().nullable().optional(),
          unitType: z.enum(['volume', 'weight', 'count']).nullable().optional(),
          itemName: z.string().nullable().optional(),
          preparation: z.string().nullable().optional()
        })
      })
    )
    .mutation(async ({ ctx, input }) => {
      return updatePantryIngredient(
        input.ingredientId,
        input.data,
        ctx.prisma
      )
    }),

  delete: protectedProcedure
    .input(z.object({ ingredientId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deletePantryIngredient(input.ingredientId, ctx.prisma)
    }),

  bulkAdd: protectedProcedure
    .input(z.object({ rawLines: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      return bulkAddToPantry(
        userId,
        input.rawLines.filter((l) => l.trim().length > 0),
        ctx.prisma
      )
    })
})
