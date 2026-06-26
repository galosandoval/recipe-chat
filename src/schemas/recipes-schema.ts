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

// Single canonical declaration of the 6 recipe facet fields. Composed into every
// input schema so adding/renaming a facet happens in exactly one place.
export const recipeFacetsSchema = z.object({
  cuisine: z.string().nullish(),
  course: z.string().nullish(),
  dietTags: z.array(z.string()).nullish(),
  flavorTags: z.array(z.string()).nullish(),
  mainIngredients: z.array(z.string()).nullish(),
  techniques: z.array(z.string()).nullish()
})

// Single source of truth for the recipe scalar columns that get forgotten per
// write-site. `.parse()` does two jobs at once: it strips unknown keys (identity
// fields id/slug/name, relations, and non-columns like url/messageId), and it
// normalizes null -> undefined so Prisma skips any field the caller didn't supply
// (no clobbering an existing value with null on update; arrays keep their DB
// default on create). name/slug are intentionally excluded — every write site sets
// those explicitly, so they're never the forgotten ones.
const nullishToUndefined = <T>(v: T | null | undefined) => v ?? undefined

const recipeWriteDataSchema = z.object({
  description: z.string().nullish().transform(nullishToUndefined),
  imgUrl: z.string().nullish().transform(nullishToUndefined),
  author: z.string().nullish().transform(nullishToUndefined),
  address: z.string().nullish().transform(nullishToUndefined),
  prepMinutes: z.number().nullish().transform(nullishToUndefined),
  cookMinutes: z.number().nullish().transform(nullishToUndefined),
  servings: z.number().nullish().transform(nullishToUndefined),
  cuisine: z.string().nullish().transform(nullishToUndefined),
  course: z.string().nullish().transform(nullishToUndefined),
  dietTags: z.array(z.string()).nullish().transform(nullishToUndefined),
  flavorTags: z.array(z.string()).nullish().transform(nullishToUndefined),
  mainIngredients: z.array(z.string()).nullish().transform(nullishToUndefined),
  techniques: z.array(z.string()).nullish().transform(nullishToUndefined)
})

// The recipe-like input every DB write site maps from — derived from the schema
// so the facet list stays single-sourced (data-access methods type their payloads
// against this instead of re-listing facets).
export type RecipeWriteInput = z.input<typeof recipeWriteDataSchema>

export const toRecipeWriteData = (r: RecipeWriteInput) =>
  recipeWriteDataSchema.parse(r)

const editRecipeSchema = z
  .object({
    description: z.string().optional(),
    name: z.string().optional(),
    imgUrl: z.string().optional(),
    prepMinutes: z.number().optional(),
    cookMinutes: z.number().optional(),
    notes: z.string().optional()
  })
  .merge(recipeFacetsSchema)

export const createRecipeSchema = z
  .object({
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
  .merge(recipeFacetsSchema)
export type CreateRecipe = z.infer<typeof createRecipeSchema>

const ingredientsAndInstructionsSchema = z.object({
  ingredients: z.array(
    z.object({
      id: z.string(),
      rawString: z.string().optional(),
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
    newNotes: z.string().optional(),
    newCuisine: z.string().optional(),
    newCourse: z.string().optional(),
    newDietTags: z.array(z.string()).optional(),
    newFlavorTags: z.array(z.string()).optional(),
    newMainIngredients: z.array(z.string()).optional(),
    newTechniques: z.array(z.string()).optional()
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

export const createRecipeFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  ingredients: z.string(),
  instructions: z.string(),
  prepMinutes: z.number(),
  cookMinutes: z.number()
})

export type CreateRecipeFormValues = z.infer<typeof createRecipeFormSchema>
