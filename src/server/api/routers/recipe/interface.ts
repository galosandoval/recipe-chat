import { RouterInputs } from 'utils/api'
import { z } from 'zod'

export const createRecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  url: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional()
})

export type CreateRecipe = RouterInputs['recipe']['create']

export type LinkedData =
  | ({
      '@context': string
    } & LinkedDataRecipeField)
  | {
      '@context': string
      '@graph': LinkedDataRecipeField[]
    }
  | ({ '@context': string } & LinkedDataRecipeField)[]

export type LinkedDataRecipeField = {
  '@type': 'Recipe'[] | 'Recipe'
  author?: {
    name?: string
    url?: string
  }[]
  cookTime?: string
  prepTime?: string
  totalTime?: string
  description?: string
  headline?: string
  image?: {
    height?: number
    url?: string
    width?: number
  }
  name?: string
  recipeIngredient?: string[]
  recipeInstructions?: {
    text?: string
  }[]
  recipeYield?: number
  url?: string
  parsingType: 'linkedData'
}

export type GeneratedRecipe = {
  name: string
  ingredients: string[]
  instructions: string[]
  description: string
  prepTime: string
  cookTime: string
}

export const updateRecipeSchema = z.object({
  id: z.number(),
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  ingredients: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      listId: z.number().optional()
    })
  ),
  instructions: z.array(z.object({ id: z.number(), description: z.string() }))
})
export type UpdateRecipe = z.infer<typeof updateRecipeSchema>
