import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from '~/server/api/trpc'
import { createChatAndRecipe, signUp } from '~/server/api/use-cases/users'
import { createChatAndRecipeSchema, signUpSchema } from '~/schemas/users'
import { UsersDataAccess } from '~/server/api/data-access/users'

export const usersRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const usersDataAccess = new UsersDataAccess(ctx.db)
    return usersDataAccess.getUserById(ctx.session.user.id)
  }),

  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      return signUp(input, ctx.db)
    }),

  createChatAndRecipe: protectedProcedure
    .input(createChatAndRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      return createChatAndRecipe(ctx, input)
    })
})
