import { type PrismaClient } from '@prisma/client'
import { type GeneratedRecipe } from '~/schemas/messages-schema'
import { RecipeVectorAccess } from '../data-access/recipe-vector-access'
import { buildSignature, embedManySignatures } from '~/lib/embeddings'
import { RECIPE_DEDUP_THRESHOLD, RECIPE_OPTIONS_TARGET } from '~/constants/chat'

/** Build the embedding signature for a transient (unsaved) generated option. */
function signatureForOption(recipe: GeneratedRecipe): string {
  return buildSignature({
    name: recipe.name,
    description: recipe.description,
    cuisine: recipe.cuisine,
    course: recipe.course,
    dietTags: recipe.dietTags ?? undefined,
    flavorTags: recipe.flavorTags ?? undefined,
    mainIngredients: recipe.mainIngredients ?? undefined,
    techniques: recipe.techniques ?? undefined
  })
}

/**
 * Drop generated recipe options that are near-duplicates of the caller's own
 * saved recipes, then cap the result at `target`. Runs entirely server-side on
 * the options turn — never on the expand turn (that was the #489 hijack).
 *
 * Suggestion embeddings are transient: they are embedded for the comparison and
 * never persisted. Fail-open — any embed/search error returns the first
 * `target` options unfiltered, because showing recipes is the job.
 */
export async function dedupeRecipeOptions(
  userId: string | undefined,
  recipes: GeneratedRecipe[],
  prisma: PrismaClient,
  target = RECIPE_OPTIONS_TARGET
): Promise<GeneratedRecipe[]> {
  if (!userId || recipes.length === 0) {
    return recipes.slice(0, target)
  }

  try {
    const vectorAccess = new RecipeVectorAccess(prisma)
    const signatures = recipes.map(signatureForOption)
    const embeddings = await embedManySignatures(signatures)
    const similarities = await vectorAccess.maxSimilarityForEmbeddings(
      userId,
      embeddings
    )

    const unique = recipes.filter(
      (_, i) => (similarities[i] ?? 0) < RECIPE_DEDUP_THRESHOLD
    )
    return unique.slice(0, target)
  } catch (err) {
    console.error('[dedupeRecipeOptions] de-duplication failed', err)
    return recipes.slice(0, target)
  }
}
