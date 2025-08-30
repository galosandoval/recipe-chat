import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from '~/server/api/trpc'
import {
  createChatAndRecipe,
  signUp
} from '~/server/api/use-cases/users-use-case'
import { signUpSchema } from '~/schemas/sign-up-schema'
import { UsersAccess } from '~/server/api/data-access/users-access'
import { createChatAndRecipeSchema } from '~/schemas/chats-schema'

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
