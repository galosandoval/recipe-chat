import { TRPCError } from '@trpc/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Needs at least 6 characters').max(20, 'Needs at most 20 characters')
})

export type AuthSchemaType = z.infer<typeof authSchema>

export const authRouter = createTRPCRouter({
  signUp: publicProcedure.input(authSchema).mutation(async ({ input, ctx }) => {
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
