import { createId } from '@paralleldrive/cuid2'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from '~/server/api/trpc'
import { createChatAndRecipe, signUp } from '~/server/api/use-cases/user'
import {
  createChatAndRecipeSchema,
  signUpSchema
} from '~/server/api/schemas/users'
import { usersDataAccess } from '~/server/api/data-access/users'

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return usersDataAccess.getUserById(ctx.session.user.id)
  }),

  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    return signUp(input)
  }),

  createChatAndRecipe: protectedProcedure
    .input(createChatAndRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      return createChatAndRecipe(ctx, input)
    })
})
