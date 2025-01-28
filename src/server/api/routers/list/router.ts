import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../../trpc'
import { type RouterInputs } from '~/utils/api'

export const listRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string()
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      return ctx.prisma.list.upsert({
        where: { userId },
        create: { userId, ingredients: { connect: input } },
        update: { ingredients: { connect: input } }
      })
    }),

  byUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.list.findFirst({
        where: { userId: { equals: input.userId } },
        select: { ingredients: { orderBy: { id: 'asc' } } }
      })
    }),

  add: protectedProcedure
    .input(
      z.object({
        newIngredientName: z.string().min(3).max(50)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newIngredient = await ctx.prisma.ingredient.create({
        data: { name: input.newIngredientName }
      })

      return ctx.prisma.list.update({
        where: { userId: ctx.session.user.id },
        data: { ingredients: { connect: { id: newIngredient.id } } }
      })
    }),

  check: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        checked: z.boolean()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.ingredient.update({
        where: { id: input.id },
        data: { checked: input.checked }
      })
    }),

  checkMany: protectedProcedure
    .input(z.array(z.object({ id: z.string(), checked: z.boolean() })))
    .mutation(async ({ ctx, input }) => {
      const mutations = input.map(({ id, checked }) =>
        ctx.prisma.ingredient.update({
          where: { id },
          data: { checked }
        })
      )

      const transaction = await ctx.prisma.$transaction(mutations)

      return { count: transaction.length }
    }),

  clear: protectedProcedure
    .input(
      z.array(z.object({ id: z.string(), recipeId: z.string().nullable() }))
    )
    .mutation(async ({ ctx, input }) => {
      // delete ingredients that are not connected to a recipe
      const toDisconnect: RouterInputs['list']['clear'] = []
      const toDelete: RouterInputs['list']['clear'] = []

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
