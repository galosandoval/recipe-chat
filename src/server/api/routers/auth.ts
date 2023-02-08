import { TRPCError } from '@trpc/server'
import { genSalt, hash } from 'bcryptjs'
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

    genSalt(10, (err, salt) => {
      if (err.message) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: err.message })
      }

      hash(input.password, salt, (err, hash) => {
        if (err.message) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err.message })
        }

        return ctx.prisma.user.create({
          data: { username: input.email, password: hash }
        })
      })
    })
  })
})
