import { z } from 'zod'
import { t } from './trpc'

export const recipeRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        imgUrl: z.string().url(),
        author: z.string(),
        address: z.string()
      })
    )
    .mutation(({ input, ctx }) => {
      const recipe = ctx.recipe.create({ data: input })
      return recipe
    })
})
