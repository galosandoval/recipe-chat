/**
 * @jest-environment node
 */
import { RecipeVectorAccess } from '~/server/api/data-access/recipe-vector-access'
import { embedSignature } from '~/lib/embeddings'
import {
  testPrisma,
  truncateAll,
  createTestUser,
  createTestRecipe,
  unitVector
} from '~/server/api/test-db'

// Only the OpenAI embedding call is mocked; buildSignature and the pgvector SQL
// run for real against the test database.
jest.mock('~/lib/embeddings', () => ({
  ...jest.requireActual('~/lib/embeddings'),
  embedSignature: jest.fn()
}))

const mockedEmbed = embedSignature as jest.MockedFunction<typeof embedSignature>

const access = new RecipeVectorAccess(testPrisma)

beforeEach(async () => {
  mockedEmbed.mockReset()
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('RecipeVectorAccess.upsertEmbedding', () => {
  it('re-embedding the same recipe updates in place rather than duplicating', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)

    mockedEmbed.mockResolvedValue(unitVector(0))
    await access.upsertEmbedding(recipe.id, user.id, 'first signature')

    mockedEmbed.mockResolvedValue(unitVector(1))
    await access.upsertEmbedding(recipe.id, user.id, 'second signature')

    const rows = await testPrisma.$queryRawUnsafe<
      Array<{ recipeId: string; signature: string }>
    >('SELECT "recipeId", "signature" FROM "RecipeVector" WHERE "recipeId" = $1', recipe.id)

    expect(rows).toHaveLength(1)
    expect(rows[0].signature).toBe('second signature')
  })
})

describe('RecipeVectorAccess.maxSimilarityForEmbeddings', () => {
  it('returns ~1 for a candidate equal to a saved vector and ~0 for an orthogonal one', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)

    mockedEmbed.mockResolvedValue(unitVector(0))
    await access.upsertEmbedding(recipe.id, user.id, 'saved signature')

    const [same, orthogonal] = await access.maxSimilarityForEmbeddings(user.id, [
      unitVector(0),
      unitVector(1)
    ])

    expect(same).toBeCloseTo(1, 5)
    expect(orthogonal).toBeCloseTo(0, 5)
  })

  it('returns 0 when the user has no saved vectors', async () => {
    const user = await createTestUser()

    const [sim] = await access.maxSimilarityForEmbeddings(user.id, [
      unitVector(0)
    ])

    expect(sim).toBe(0)
  })

  it("ignores another user's saved recipes", async () => {
    const owner = await createTestUser()
    const other = await createTestUser()
    const otherRecipe = await createTestRecipe(other.id)

    mockedEmbed.mockResolvedValue(unitVector(0))
    await access.upsertEmbedding(otherRecipe.id, other.id, 'other signature')

    const [sim] = await access.maxSimilarityForEmbeddings(owner.id, [
      unitVector(0)
    ])

    expect(sim).toBe(0)
  })

  it('ignores the caller’s own unsaved recipes', async () => {
    const user = await createTestUser()
    const unsaved = await createTestRecipe(user.id, { saved: false })

    mockedEmbed.mockResolvedValue(unitVector(0))
    await access.upsertEmbedding(unsaved.id, user.id, 'unsaved signature')

    const [sim] = await access.maxSimilarityForEmbeddings(user.id, [
      unitVector(0)
    ])

    expect(sim).toBe(0)
  })
})

describe('RecipeVectorAccess.buildSignatureFromRecipe', () => {
  it('derives the embedding signature from the recipe facet fields', () => {
    const signature = access.buildSignatureFromRecipe({
      name: 'Carbonara',
      description: 'Roman pasta',
      cuisine: 'Italian',
      course: 'Dinner',
      dietTags: [],
      flavorTags: ['Savory'],
      mainIngredients: ['Egg', 'Pancetta'],
      techniques: ['Emulsify']
    })

    expect(signature).toBe(
      [
        'carbonara',
        'cuisine: italian',
        'course: dinner',
        'mains: egg, pancetta',
        'techniques: emulsify',
        'flavors: savory',
        'summary: Roman pasta'
      ].join('\n')
    )
  })
})
