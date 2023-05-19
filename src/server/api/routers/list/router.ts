import { createTRPCRouter, protectedProcedure } from '../../trpc'
import {
  addIngredientSchema,
  clearListSchema,
  ingredientSchema
} from './interface'

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

  add: protectedProcedure
    .input(addIngredientSchema)
    .mutation(async ({ ctx, input }) => {
      const newIngredient = await ctx.prisma.ingredient.create({
        data: { name: input.newIngredientName }
      })

      return ctx.prisma.list.update({
        where: { userId: ctx.session.user.id },
        data: { ingredients: { connect: { id: newIngredient.id } } }
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
