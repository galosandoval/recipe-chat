import { createTRPCRouter, protectedProcedure } from 'server/api/trpc'

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: ctx.session.user.id
      }
    })
  })
})
