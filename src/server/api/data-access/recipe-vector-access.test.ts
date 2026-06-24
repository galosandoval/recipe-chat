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

describe('RecipeVectorAccess.upsertEmbedding + searchSimilar', () => {
  it('stores a recipe embedding that similarity search can retrieve', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)
    mockedEmbed.mockResolvedValue(unitVector(0))

    await access.upsertEmbedding(recipe.id, user.id, 'spicy noodles')

    const results = await access.searchSimilar(user.id, unitVector(0), 5)

    expect(results).toHaveLength(1)
    expect(results[0].recipeId).toBe(recipe.id)
    expect(Number(results[0].cosineSim)).toBeCloseTo(1)
  })

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

  it('ranks results by cosine similarity to the query vector', async () => {
    const user = await createTestUser()
    const aligned = await createTestRecipe(user.id, { name: 'Aligned' })
    const orthogonal = await createTestRecipe(user.id, { name: 'Orthogonal' })

    mockedEmbed.mockResolvedValue(unitVector(0))
    await access.upsertEmbedding(aligned.id, user.id, 'aligned')
    mockedEmbed.mockResolvedValue(unitVector(1))
    await access.upsertEmbedding(orthogonal.id, user.id, 'orthogonal')

    const results = await access.searchSimilar(user.id, unitVector(0), 10)

    expect(results.map((r) => r.recipeId)).toEqual([aligned.id, orthogonal.id])
    expect(Number(results[0].cosineSim)).toBeCloseTo(1)
    expect(Number(results[1].cosineSim)).toBeCloseTo(0)
  })

  it('caps the number of results at the requested limit', async () => {
    const user = await createTestUser()
    for (let axis = 0; axis < 3; axis++) {
      const recipe = await createTestRecipe(user.id)
      mockedEmbed.mockResolvedValue(unitVector(axis))
      await access.upsertEmbedding(recipe.id, user.id, `sig-${axis}`)
    }

    const results = await access.searchSimilar(user.id, unitVector(0), 2)

    expect(results).toHaveLength(2)
  })

  it('only returns vectors belonging to the querying user', async () => {
    const owner = await createTestUser()
    const stranger = await createTestUser()
    const ownerRecipe = await createTestRecipe(owner.id)
    const strangerRecipe = await createTestRecipe(stranger.id)

    mockedEmbed.mockResolvedValue(unitVector(0))
    await access.upsertEmbedding(ownerRecipe.id, owner.id, 'owner')
    await access.upsertEmbedding(strangerRecipe.id, stranger.id, 'stranger')

    const results = await access.searchSimilar(owner.id, unitVector(0), 10)

    expect(results).toHaveLength(1)
    expect(results[0].recipeId).toBe(ownerRecipe.id)
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
