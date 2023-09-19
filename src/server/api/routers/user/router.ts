import { TRPCError } from '@trpc/server'
import { hash } from 'bcryptjs'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from 'server/api/trpc'
import { z } from 'zod'

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: ctx.session.user.id
      }
    })
  }),

  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z
          .string()
          .min(6, 'Needs at least 6 characters')
          .max(20, 'Needs at most 20 characters')
      })
    )
    .mutation(async ({ input, ctx }) => {
      const username = input.email.toLowerCase()

      const duplicateUser = await ctx.prisma.user.findFirst({
        where: { username }
      })

      if (duplicateUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists.'
        })
      }
      const hashedPassword = await hash(input.password, 10)
      return ctx.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          list: { create: {} }
        }
      })
    })
})
