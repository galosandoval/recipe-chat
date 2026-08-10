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
    .query(async ({ input }) => {
      return await getAllFilters(input.userId)
    }),

  check: protectedProcedure
    .input(checkFilterSchema)
    .mutation(async ({ input }) => {
      return await updateFilterCheckStatus(input)
    }),

  save: protectedProcedure
    .input(saveFiltersSchema)
    .mutation(async ({ ctx, input }) => {
      return await saveFilters({ ...input, userId: ctx.session.user.id })
    })
})
