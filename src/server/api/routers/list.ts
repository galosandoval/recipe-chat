import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const ingredientSchema = z.array(
  z.object({
    id: z.number()
  })
)
const clearListSchema = z.array(z.object({ id: z.number() }))

export type CreateList = z.infer<typeof ingredientSchema>

export const listRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(ingredientSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      return ctx.prisma.list.upsert({
        where: { userId },
        create: { userId, ingredients: { connect: input } },
        update: { ingredients: { connect: input } }
      })
    }),

  byUserId: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.list.findFirst({
      where: { userId: { equals: ctx.session.user.id } },
      select: { ingredients: true }
    })
  }),

  clear: protectedProcedure
    .input(clearListSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.list.update({
        where: { userId: ctx.session.user.id },
        data: { ingredients: { disconnect: input } }
      })
    })
})
