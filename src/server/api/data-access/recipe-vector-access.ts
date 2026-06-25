import { type Recipe } from '@prisma/client'
import { DataAccess } from './data-access'
import {
  buildSignature,
  embedSignature,
  type RecipeSignatureParts
} from '~/lib/embeddings'

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

  async upsertEmbedding(recipeId: string, userId: string, signature: string) {
    const vector = await embedSignature(signature)
    const vectorLiteral = `[${vector.join(',')}]`

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

  // Only saved recipes are searchable: unsaved rows are throwaway chat
  // suggestions (no ingredients/instructions), so surfacing them links to an
  // empty recipe. Matches how the rest of the app defines "my recipes".
  async searchSimilar(userId: string, embedding: number[], limit: number) {
    const vectorLiteral = `'[${embedding.join(',')}]'`
    return await this.prisma.$queryRawUnsafe<
      Array<{ recipeId: string; cosineSim: number }>
    >(
      `
      SELECT v."recipeId",
             1 - (v."embedding" <=> ${vectorLiteral}::vector) AS "cosineSim"
      FROM "RecipeVector" v
      JOIN "Recipe" r ON r.id = v."recipeId"
      WHERE v."userId" = $1 AND r.saved = true
      ORDER BY v."embedding" <=> ${vectorLiteral}::vector
      LIMIT $2
    `,
      userId,
      limit
    )
  }
}
