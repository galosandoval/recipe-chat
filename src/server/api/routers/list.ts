import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const IngredientSchema = z.array(
  z.object({
    id: z.number()
  })
)

export type CreateList = z.infer<typeof IngredientSchema>

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .input(IngredientSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.list.create({
        data: {
          ingredients: {
            connect: input
          },
          userId: parseInt(ctx.session.user.id)
        }
      })
      return result
    }),

  byUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id)

    return await ctx.prisma.list.findFirst({
      where: { userId: { equals: userId } },
      select: { ingredients: true }
    })
  })
})
