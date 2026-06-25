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
