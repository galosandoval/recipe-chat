import { z } from 'zod'
import { roleSchema } from '~/schemas/messages'

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

const messageSchema = z.object({
  content: z.string(),
  role: roleSchema
})

export const generateSchema = z.object({
  content: z.string(),
  messages: z.array(messageSchema).nullish(),
  filters: z.array(z.string()).optional(),
  chatId: z.string().optional()
})

export const updateRecipeImgUrlSchema = z.object({
  id: z.string(),
  imgUrl: z.string(),
  oldUrl: z.string().optional()
})
export type UpdateRecipeImgUrl = z.infer<typeof updateRecipeImgUrlSchema>
