import { z } from 'zod'

export const recipeUrlSchema = (t: any) =>
  z.object({
    url: z.string().url(t.recipes.enterUrl)
  })

export type RecipeUrlSchemaType = z.infer<ReturnType<typeof recipeUrlSchema>>
