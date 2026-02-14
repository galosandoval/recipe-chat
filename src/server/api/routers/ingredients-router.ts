import type { Ingredient } from '@prisma/client'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { getAllIngredients } from '~/server/api/use-cases/ingredients-use-case'
import { parseIngredientName } from '~/lib/parse-ingredient'

export const ingredientsRouter = createTRPCRouter({
  getAllIngredients: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    return getAllIngredients(userId, ctx.prisma)
  }),

  /** Returns all ingredients for the current user with parser output (for testing). Check network tab for JSON. */
  getParsedIngredients: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const ingredients = await getAllIngredients(userId, ctx.prisma)
    return ingredients.map((ing: Ingredient) => ({
      id: ing.id,
      name: ing.name,
      parsed: parseIngredientName(ing.name)
    }))
  })
})
