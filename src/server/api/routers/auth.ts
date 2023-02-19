import { TRPCError } from '@trpc/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(14)
})

export type AuthSchemaType = z.infer<typeof authSchema>

export const authRouter = createTRPCRouter({
  signUp: publicProcedure.input(authSchema).mutation(async ({ input, ctx }) => {
    const duplicateUser = await ctx.prisma.user.findFirst({
      where: { username: input.email }
    })

    if (duplicateUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User already exists.'
      })
    }
    const hashedPassword = await hash(input.password, 10)
    return ctx.prisma.user.create({
      data: { username: input.email, password: hashedPassword }
    })
  })
})
