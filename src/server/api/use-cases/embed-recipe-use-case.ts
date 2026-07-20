import { type Recipe, type PrismaClient } from '@prisma/client'
import { RecipesAccess } from '../data-access/recipes-access'
import { RecipeVectorAccess } from '../data-access/recipe-vector-access'

/**
 * The single place a recipe gets embedded. Loads the recipe by id, builds its
 * signature, and upserts the vector. Non-throwing: a failed embedding is logged
 * and swallowed so it never blocks saving or editing a recipe.
 */
export async function embedRecipeById(
  recipeId: string,
  userId: string,
  prisma: PrismaClient
): Promise<void> {
  try {
    const recipe = await new RecipesAccess(prisma).getRecipeById(recipeId)
    if (!recipe) {
      console.error('[recipe-vector] embedRecipeById: recipe not found', {
        recipeId
      })
      return
    }

    const vectorAccess = new RecipeVectorAccess(prisma)
    const signature = vectorAccess.buildSignatureFromRecipe(recipe)
    await vectorAccess.upsertEmbedding(recipeId, userId, signature)
  } catch (err) {
    console.error('[recipe-vector] upsertEmbedding failed', { recipeId, err })
  }
}

/**
 * Recipe fields that feed the embedding signature. Editing any of these makes
 * the stored vector stale. Owned here — the Recipe Vector module — so "which
 * fields are semantic, and when to re-embed" is written down in exactly one
 * place and every edit path (form, chat tool) inherits the same policy.
 */
const SEMANTIC_FIELDS = new Set<keyof Recipe>([
  'name',
  'description',
  'cuisine',
  'course',
  'dietTags',
  'flavorTags',
  'mainIngredients',
  'techniques'
])

/**
 * Re-embed the recipe when — and only when — one of the fields the caller's edit
 * actually wrote is semantic. A notes/timing-only edit skips the needless
 * re-embed. Fail-open through {@link embedRecipeById}, so a failed embedding
 * never fails the edit.
 */
export async function reembedIfSemanticChange(
  changedFields: Array<keyof Recipe>,
  recipeId: string,
  userId: string,
  prisma: PrismaClient
): Promise<void> {
  if (changedFields.some((field) => SEMANTIC_FIELDS.has(field))) {
    await embedRecipeById(recipeId, userId, prisma)
  }
}
