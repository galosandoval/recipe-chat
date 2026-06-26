import { type Recipe } from '@prisma/client'
import { DataAccess } from './data-access'
import {
  buildSignature,
  embedSignature,
  type RecipeSignatureParts
} from '~/lib/embeddings'

/** pgvector cosine literal, e.g. `[0.1,0.2,...]`. */
function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(',')}]`
}

type SignatureSource = Pick<
  Recipe,
  | 'name'
  | 'description'
  | 'cuisine'
  | 'course'
  | 'dietTags'
  | 'flavorTags'
  | 'mainIngredients'
  | 'techniques'
>

export class RecipeVectorAccess extends DataAccess {
  buildSignatureFromRecipe(recipe: SignatureSource) {
    const parts: RecipeSignatureParts = {
      name: recipe.name,
      description: recipe.description,
      cuisine: recipe.cuisine,
      course: recipe.course,
      dietTags: recipe.dietTags,
      flavorTags: recipe.flavorTags,
      mainIngredients: recipe.mainIngredients,
      techniques: recipe.techniques
    }
    return buildSignature(parts)
  }

  /**
   * For each candidate embedding, the highest cosine similarity (0–1) against
   * the user's own SAVED recipe vectors. Returns `0` for a candidate when the
   * user has no saved vectors. Scoped to `userId` + `Recipe.saved = true`, so
   * results never include another user's or unsaved recipes.
   */
  async maxSimilarityForEmbeddings(
    userId: string,
    embeddings: number[][]
  ): Promise<number[]> {
    return Promise.all(
      embeddings.map(async (embedding) => {
        const rows = await this.prisma.$queryRawUnsafe<Array<{ sim: number }>>(
          `
          SELECT 1 - (rv."embedding" <=> $1::vector) AS sim
          FROM "RecipeVector" rv
          JOIN "Recipe" r ON r.id = rv."recipeId"
          WHERE rv."userId" = $2 AND r."saved" = true
          ORDER BY rv."embedding" <=> $1::vector ASC
          LIMIT 1
        `,
          toVectorLiteral(embedding),
          userId
        )
        return rows[0]?.sim ?? 0
      })
    )
  }

  async upsertEmbedding(recipeId: string, userId: string, signature: string) {
    const vector = await embedSignature(signature)
    const vectorLiteral = toVectorLiteral(vector)

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO "RecipeVector" ("recipeId", "userId", "signature", "embedding", "updatedAt")
      VALUES ($1, $2, $3, $4::vector, now())
      ON CONFLICT ("recipeId") DO UPDATE
        SET "signature" = EXCLUDED."signature",
            "embedding" = EXCLUDED."embedding",
            "updatedAt" = now()
    `,
      recipeId,
      userId,
      signature,
      vectorLiteral
    )
  }
}
