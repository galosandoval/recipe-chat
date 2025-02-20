import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  deleteFilter,
  getAllFilters,
  updateFilterCheckStatus
} from '~/server/api/use-cases/filters'
import {
  checkFilterSchema,
  deleteFilterSchema,
  getFiltersByUserIdSchema
} from '~/server/api/schemas/filters'
import { z } from 'zod'

export const filtersRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(getFiltersByUserIdSchema)
    .query(async ({ input, ctx }) => {
      return await getAllFilters(input.userId, ctx.prisma)
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(20),
        id: z.string().cuid2()
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.filter.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          checked: true,
          id: input.id
        }
      })
    }),

  delete: protectedProcedure
    .input(deleteFilterSchema)
    .mutation(async ({ ctx, input }) => {
      return await deleteFilter(input, ctx.prisma)
    }),

  check: protectedProcedure
    .input(checkFilterSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateFilterCheckStatus(input, ctx.prisma)
    })
})
