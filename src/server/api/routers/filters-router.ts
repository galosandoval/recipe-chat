import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  getAllFilters,
  saveFilters,
  updateFilterCheckStatus
} from '~/server/api/use-cases/filters-use-case'
import {
  checkFilterSchema,
  getFiltersByUserIdSchema,
  saveFiltersSchema
} from '~/schemas/filters-schema'

export const filtersRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(getFiltersByUserIdSchema)
    .query(async ({ input, ctx }) => {
      return await getAllFilters(input.userId, ctx.prisma)
    }),

  check: protectedProcedure
    .input(checkFilterSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateFilterCheckStatus(input, ctx.prisma)
    }),

  save: protectedProcedure
    .input(saveFiltersSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveFilters(
        { ...input, userId: ctx.session.user.id },
        ctx.prisma
      )
    })
})
