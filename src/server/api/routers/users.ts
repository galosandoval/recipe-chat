import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from '~/server/api/trpc'
import { createChatAndRecipe, signUp } from '~/server/api/use-cases/users'
import {
  createChatAndRecipeSchema,
  signUpSchema
} from '~/server/api/schemas/users'
import { UsersAccess } from '~/server/api/data-access/users-access'

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const usersDataAccess = new UsersAccess(ctx.prisma)
    return usersDataAccess.getUserById(ctx.session.user.id)
  }),

  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      return signUp(input, ctx.prisma)
    }),

  createChatAndRecipe: protectedProcedure
    .input(createChatAndRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      return createChatAndRecipe(ctx, input)
    })
})
