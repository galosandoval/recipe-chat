import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../../trpc'

export const filterRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input

      const filter = await ctx.prisma.filter.findMany({
        where: { userId }
      })

      return filter
    }),

  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        name: z.string().min(3).max(20),
        id: z.string().cuid2()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, name } = input

      return await ctx.prisma.filter.create({
        data: { userId, name, checked: true, id: input.id }
      })
    }),

  check: protectedProcedure
    .input(z.object({ filterId: z.string().cuid2(), checked: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { filterId, checked } = input

      return await ctx.prisma.filter.update({
        data: { checked },
        where: { id: filterId }
      })
    }),

  delete: protectedProcedure
    .input(z.object({ filterId: z.string().cuid2() }))
    .mutation(async ({ input, ctx }) => {
      const { filterId } = input

      return await ctx.prisma.filter.delete({ where: { id: filterId } })
    })
})
