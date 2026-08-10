import { z } from 'zod'
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
import { usersAccess } from '~/server/api/data-access/users-access'
import { createChatAndRecipeSchema } from '~/schemas/chats-schema'

const updatePreferredUnitsSchema = z.object({
  preferredWeightUnit: z.string().nullable().optional(),
  preferredVolumeUnit: z.string().nullable().optional()
})

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return usersAccess.getUserById(ctx.session.user.id)
  }),

  updatePreferredUnits: protectedProcedure
    .input(updatePreferredUnitsSchema)
    .mutation(async ({ ctx, input }) => {
      return usersAccess.updatePreferredUnits(ctx.session.user.id, input)
    }),

  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    return signUp(input)
  }),

  createChatAndRecipe: protectedProcedure
    .input(createChatAndRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      return createChatAndRecipe(ctx.session.user.id, input)
    })
})
