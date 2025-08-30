import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  deleteFilter,
  getAllFilters,
  updateFilterCheckStatus
} from '~/server/api/use-cases/filters-use-case'
import {
  checkFilterSchema,
  createFilterSchema,
  deleteFilterSchema,
  getFiltersByUserIdSchema
} from '~/server/api/schemas/filters-schema'
import { FiltersAccess } from '../data-access/filters-access'

export const filtersRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(getFiltersByUserIdSchema)
    .query(async ({ input, ctx }) => {
      ctx.headers.set('cookie', 'test=test')
      const cookies = ctx.headers.getSetCookie()
      console.log('cookies--->', cookies)
      return await getAllFilters(input.userId, ctx.prisma)
    }),

  create: protectedProcedure
    .input(createFilterSchema.omit({ userId: true }))
    .mutation(async ({ input, ctx }) => {
      const filtersAccess = new FiltersAccess(ctx.prisma)
      return await filtersAccess.createFilter({
        ...input,
        userId: ctx.session.user.id,
        filterId: input.filterId
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
