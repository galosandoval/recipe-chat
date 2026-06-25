import { randomUUID } from 'crypto'
import { PrismaClient } from '@prisma/client'

/**
 * A dedicated Prisma client for backend integration tests. Reads the connection
 * URL from `.env.test.local` (loaded by next/jest when NODE_ENV=test), so it
 * targets the `recipe-chat-test` database rather than dev data.
 */
export const testPrisma = new PrismaClient()

/** Wipe the tables these tests touch. RecipeVector cascades from Recipe. */
export async function truncateAll() {
  await testPrisma.$executeRawUnsafe(
    'TRUNCATE TABLE "RecipeVector", "Recipe", "User" RESTART IDENTITY CASCADE'
  )
}

export async function createTestUser() {
  return testPrisma.user.create({
    data: {
      username: `user-${randomUUID()}`,
      password: 'hashed-password'
    }
  })
}

export async function createTestRecipe(
  userId: string,
  overrides: {
    name?: string
    description?: string | null
    cuisine?: string | null
    course?: string | null
    dietTags?: string[]
    flavorTags?: string[]
    mainIngredients?: string[]
    techniques?: string[]
    saved?: boolean
  } = {}
) {
  const { name, saved, ...rest } = overrides
  const id = randomUUID()
  return testPrisma.recipe.create({
    data: {
      name: name ?? 'Test Recipe',
      slug: `recipe-${id}`,
      userId,
      // Search is saved-only; default to a "real" saved recipe so search tests
      // exercise the realistic path. Pass saved: false to test exclusion.
      saved: saved ?? true,
      ...rest
    }
  })
}

/**
 * A 1536-dim vector that is `1` at `axis` and `0` elsewhere. Two such vectors on
 * different axes are orthogonal (cosine similarity 0); identical axes give 1.
 * Lets tests assert cosine ranking deterministically without real embeddings.
 */
export function unitVector(axis: number, dim = 1536): number[] {
  const v = new Array<number>(dim).fill(0)
  v[axis] = 1
  return v
}
