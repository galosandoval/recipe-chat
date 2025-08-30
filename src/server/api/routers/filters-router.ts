import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  createFilter,
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

export const filtersRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(getFiltersByUserIdSchema)
    .query(async ({ input, ctx }) => {
      return await getAllFilters(input.userId, ctx.prisma)
    }),

  create: protectedProcedure
    .input(createFilterSchema.omit({ userId: true }))
    .mutation(async ({ input, ctx }) => {
      return await createFilter(
        {
          ...input,
          userId: ctx.session.user.id
        },
        ctx.prisma
      )
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
