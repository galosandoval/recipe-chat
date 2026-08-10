import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  getTasteProfile,
  upsertTasteProfile
} from '~/server/api/use-cases/taste-profile-use-case'
import { tasteProfileSchema } from '~/schemas/taste-profile-schema'

export const tasteProfileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getTasteProfile(ctx.session.user.id)
  }),

  upsert: protectedProcedure
    .input(tasteProfileSchema)
    .mutation(async ({ input, ctx }) => {
      return await upsertTasteProfile(ctx.session.user.id, input)
    }),

  skip: protectedProcedure.mutation(async ({ ctx }) => {
    return await upsertTasteProfile(ctx.session.user.id, {
      dietaryRestrictions: [],
      cuisinePreferences: ['American'],
      cookingSkill: 'intermediate',
      householdSize: 2,
      healthGoals: []
    })
  })
})
