import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { createChatAndRecipe } from '~/server/api/use-cases/users'
import { createChatAndRecipeSchema } from '~/schemas/users'
import { UsersDataAccess } from '~/server/api/data-access/users'

export const usersRouter = createTRPCRouter({
	get: protectedProcedure.query(async ({ ctx }) => {
		const usersDataAccess = new UsersDataAccess(ctx.db)
		console.log('user', usersDataAccess.getUserById(ctx.session.user.id))
		return usersDataAccess.getUserById(ctx.session.user.id)
	}),
	createChatAndRecipe: protectedProcedure
		.input(createChatAndRecipeSchema)
		.mutation(async ({ ctx, input }) => {
			return createChatAndRecipe(ctx, input)
		})
})
