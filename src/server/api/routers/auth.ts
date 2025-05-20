import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { signUp } from '~/server/api/use-cases/users'
import { TRPCError } from '@trpc/server'
import { signUpSchema } from '~/schemas/auth'

export const authRouter = createTRPCRouter({
	signUp: publicProcedure
		.input(signUpSchema)
		.mutation(async ({ input, ctx }) => {
			const result = await signUp(input, ctx.db)

			if (!result) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to sign up'
				})
			}

			return result
		})
})
