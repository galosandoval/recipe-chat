import { z } from 'zod'
import type { RecipeByIdData } from '~/hooks/use-recipe'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { cuid } from '~/lib/createId'

/**
 * A single staged diet/flavor tag row. The `id` is a stable client key so
 * `useFieldArray` can track rows across re-renders; only `value` is persisted.
 */
const tagDraftSchema = z.object({ id: z.string(), value: z.string() })
export type TagDraft = z.infer<typeof tagDraftSchema>

/**
 * The page-level draft for inline recipe editing. Ingredients and instructions
 * stay as newline-joined text (matching the existing edit transform), while the
 * four editable Facets are staged here so one Save commits everything together.
 */
export const recipeEditSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  prepMinutes: z.number(),
  cookMinutes: z.number(),
  ingredients: z.string(),
  instructions: z.string(),
  notes: z.string(),
  cuisine: z.string(),
  course: z.string(),
  dietTags: z.array(tagDraftSchema),
  flavorTags: z.array(tagDraftSchema)
})

export type RecipeEditValues = z.infer<typeof recipeEditSchema>

/** Seeds the edit draft from the currently displayed Recipe. */
export function toRecipeEditDefaults(data: RecipeByIdData): RecipeEditValues {
  return {
    name: data.name || '',
    description: data.description || '',
    prepMinutes: data.prepMinutes ?? 0,
    cookMinutes: data.cookMinutes ?? 0,
    ingredients:
      data.ingredients.map((i) => getIngredientDisplayText(i)).join('\n') || '',
    instructions: data.instructions.map((i) => i.description).join('\n') || '',
    notes: data.notes || '',
    cuisine: data.cuisine ?? '',
    course: data.course ?? '',
    dietTags: toTagDrafts(data.dietTags),
    flavorTags: toTagDrafts(data.flavorTags)
  }
}

function toTagDrafts(tags: string[] | null | undefined): TagDraft[] {
  return (tags ?? []).map((value) => ({ id: cuid(), value }))
}
