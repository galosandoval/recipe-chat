/**
 * @jest-environment node
 */
import { dedupeRecipeOptions } from '~/server/api/use-cases/dedupe-recipe-options-use-case'
import { RecipeVectorAccess } from '~/server/api/data-access/recipe-vector-access'
import {
  embedSignature,
  embedManySignatures
} from '~/lib/embeddings'
import {
  testPrisma,
  truncateAll,
  createTestUser,
  createTestRecipe,
  unitVector
} from '~/server/api/test-db'
import type { GeneratedRecipe } from '~/schemas/messages-schema'

// Mock only the OpenAI embedding calls; buildSignature and the pgvector search
// SQL run for real against the test database.
jest.mock('~/lib/embeddings', () => ({
  ...jest.requireActual('~/lib/embeddings'),
  embedSignature: jest.fn(),
  embedManySignatures: jest.fn()
}))

const mockedEmbed = embedSignature as jest.MockedFunction<typeof embedSignature>
const mockedEmbedMany = embedManySignatures as jest.MockedFunction<
  typeof embedManySignatures
>

function makeRecipe(name: string): GeneratedRecipe {
  return {
    name,
    description: `${name} description`,
    cuisine: null,
    course: null,
    dietTags: null,
    flavorTags: null,
    mainIngredients: null,
    techniques: null
  }
}

beforeEach(async () => {
  mockedEmbed.mockReset()
  mockedEmbedMany.mockReset()
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('dedupeRecipeOptions', () => {
  it('drops a candidate that near-duplicates a saved recipe and keeps distinct ones', async () => {
    const user = await createTestUser()
    const saved = await createTestRecipe(user.id)

    mockedEmbed.mockResolvedValue(unitVector(0))
    await new RecipeVectorAccess(testPrisma).upsertEmbedding(
      saved.id,
      user.id,
      'saved signature'
    )

    const dup = makeRecipe('Duplicate Dish')
    const unique = makeRecipe('Fresh Idea')
    mockedEmbedMany.mockResolvedValue([unitVector(0), unitVector(5)])

    const result = await dedupeRecipeOptions(user.id, [dup, unique], testPrisma)

    expect(result.map((r) => r.name)).toEqual(['Fresh Idea'])
  })

  it('caps survivors at the target count', async () => {
    const user = await createTestUser()
    const candidates = [1, 2, 3, 4, 5].map((n) => makeRecipe(`Recipe ${n}`))
    // All orthogonal to anything saved (none saved here) → all unique.
    mockedEmbedMany.mockResolvedValue(candidates.map((_, i) => unitVector(i)))

    const result = await dedupeRecipeOptions(user.id, candidates, testPrisma, 3)

    expect(result).toHaveLength(3)
  })

  it('returns the first N unfiltered when there is no userId (anonymous)', async () => {
    const candidates = [1, 2, 3, 4, 5].map((n) => makeRecipe(`Recipe ${n}`))

    const result = await dedupeRecipeOptions(undefined, candidates, testPrisma, 3)

    expect(result.map((r) => r.name)).toEqual(['Recipe 1', 'Recipe 2', 'Recipe 3'])
    expect(mockedEmbedMany).not.toHaveBeenCalled()
  })

  it('fails open to the first N when embedding throws', async () => {
    const user = await createTestUser()
    const candidates = [1, 2, 3, 4].map((n) => makeRecipe(`Recipe ${n}`))
    mockedEmbedMany.mockRejectedValue(new Error('embedding service down'))

    const result = await dedupeRecipeOptions(user.id, candidates, testPrisma, 3)

    expect(result.map((r) => r.name)).toEqual(['Recipe 1', 'Recipe 2', 'Recipe 3'])
  })
})
