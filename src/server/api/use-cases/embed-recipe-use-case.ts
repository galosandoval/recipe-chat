import { type PrismaClient } from '@prisma/client'
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
