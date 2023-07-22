import { createTRPCRouter, protectedProcedure } from '../../trpc'
import {
  ClearList,
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
      select: { ingredients: { orderBy: { id: 'asc' } } }
    })
  }),

  findId: protectedProcedure.query(async ({ ctx }) => {
    const list = await ctx.prisma.list.findFirst({
      where: { userId: { equals: ctx.session.user.id } },
      select: { id: true }
    })
    return list?.id
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
      // delete ingredients that are not connected to a recipe
      const toDisconnect: ClearList = []
      const toDelete: ClearList = []

      for (const ingredient of input) {
        if (ingredient.recipeId) {
          toDisconnect.push(ingredient)
        } else {
          toDelete.push(ingredient)
        }
      }

      if (toDisconnect.length) {
        await ctx.prisma.list.update({
          where: { userId: ctx.session.user.id },
          data: {
            ingredients: { disconnect: toDisconnect.map(({ id }) => ({ id })) }
          }
        })
      }
      if (toDelete.length) {
        await ctx.prisma.ingredient.deleteMany({
          where: { id: { in: toDelete.map(({ id }) => id) } }
        })
      }
    })
})
