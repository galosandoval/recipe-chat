import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const ingredientSchema = z.array(
  z.object({
    id: z.number()
  })
)
const patchListSchema = z.object({
  ingredientIds: z.array(z.number()),
  listId: z.number()
})

export type CreateList = z.infer<typeof ingredientSchema>

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .input(ingredientSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('userId', ctx.session.user.id)
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

  patch: protectedProcedure
    .input(patchListSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.ingredient.updateMany({
        where: { id: { in: input.ingredientIds } },
        data: { listId: input.listId }
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
