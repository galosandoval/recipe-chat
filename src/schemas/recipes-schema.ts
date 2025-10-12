import type { Ingredient, Instruction } from '@prisma/client'
import type { Recipe } from '@prisma/client'
import { z } from 'zod'

export const recipeUrlSchema = (urlError: string) =>
  z.object({
    url: z.string().url(urlError)
  })

export type RecipeUrlSchemaType = z.infer<ReturnType<typeof recipeUrlSchema>>

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
  cookMinutes?: number
  prepMinutes?: number
  totalTime?: string
  description?: string
  headline?: string
  image?: {
    height?: string
    url?: string
    width?: string
  }
  name?: string
  recipeIngredient?: string[]
  recipeInstructions?: {
    text?: string
  }[]
  recipeYield?: string
  url?: string
  parsingType: 'linkedData'
}

const editRecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string().optional(),
  imgUrl: z.string().optional(),
  prepMinutes: z.number().optional(),
  cookMinutes: z.number().optional(),
  notes: z.string().optional()
})

export const createRecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  url: z.string().optional(),
  prepMinutes: z.number().optional(),
  cookMinutes: z.number().optional(),
  messageId: z.string().optional()
})
export type CreateRecipe = z.infer<typeof createRecipeSchema>

const ingredientsAndInstructionsSchema = z.object({
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      listId: z.string().nullable(),
      recipeId: z.string().nullable()
    })
  ),
  instructions: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      recipeId: z.string()
    })
  )
})

export const updateRecipeSchema = z
  .object({
    id: z.string(),
    newDescription: z.string().optional(),
    newName: z.string(),
    newImgUrl: z.string().optional(),
    newAuthor: z.string().optional(),
    newAddress: z.string().optional(),
    newPrepMinutes: z.number().optional(),
    newCookMinutes: z.number().optional(),
    newIngredients: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        listId: z.string().optional()
      })
    ),
    newInstructions: z.array(
      z.object({ id: z.string(), description: z.string() })
    ),
    newNotes: z.string().optional()
  })
  .merge(ingredientsAndInstructionsSchema)
  .merge(editRecipeSchema)

export type UpdateRecipe = z.infer<typeof updateRecipeSchema>

export const updateRecipeImgUrlSchema = z.object({
  id: z.string(),
  imgUrl: z.string(),
  oldUrl: z.string().optional()
})

export type RecipeToEdit = Recipe & {
  ingredients: Ingredient[]
  instructions: Instruction[]
}

export const editRecipeFormValues = z.object({
  name: z.string(),
  ingredients: z.string(),
  instructions: z.string(),
  description: z.string(),
  prepMinutes: z.number(),
  cookMinutes: z.number(),
  notes: z.string()
})

export type EditRecipeFormValues = z.infer<typeof editRecipeFormValues>
