import { prisma } from '~/server/db'
import { buildSignature, embedSignature } from '~/utils/embeddings'

export async function nearestNeighborsForUser(
  userId: string,
  candidateVec: number[],
  limit = 5
) {
  const literal = `[${candidateVec.join(',')}]`
  // cosine similarity = 1 - cosine distance; <=> is pgvector distance
  return prisma.$queryRawUnsafe<
    Array<{ recipeId: string; cosine_sim: number }>
  >(
    `
    SELECT "recipeId",
           1 - ("embedding" <=> ${literal}::vector) AS cosine_sim
    FROM "RecipeVector"
    WHERE "userId" = $1
    ORDER BY "embedding" <=> ${literal}::vector
    LIMIT $2
  `,
    userId,
    limit
  )
}

type Candidate = {
  name: string
  description?: string | null
  cuisine?: string | null
  course?: string | null
  dietTags?: string[]
  flavorTags?: string[]
  mainIngredients?: string[]
  techniques?: string[]
}

export async function filterNovelForUser(
  userId: string,
  candidates: Candidate[]
) {
  const kept: Candidate[] = []

  for (const c of candidates) {
    const signature = buildSignature({
      name: c.name,
      description: c.description ?? '',
      cuisine: c.cuisine ?? '',
      course: c.course ?? '',
      dietTags: c.dietTags ?? [],
      flavorTags: c.flavorTags ?? [],
      mainIngredients: c.mainIngredients ?? [],
      techniques: c.techniques ?? []
    })
    const vec = await embedSignature(signature)
    const neighbors = await nearestNeighborsForUser(userId, vec, 5)

    // tighten threshold if cuisines likely match
    const threshold = c.cuisine && c.cuisine.length > 0 ? 0.92 : 0.88
    const tooSimilar = neighbors.some((n) => n.cosine_sim >= threshold)

    if (!tooSimilar) kept.push(c)
  }
  return kept
}
