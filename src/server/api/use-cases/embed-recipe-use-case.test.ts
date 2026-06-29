/**
 * @jest-environment node
 */
import { embedRecipeById } from '~/server/api/use-cases/embed-recipe-use-case'
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

const vectorAccess = new RecipeVectorAccess(testPrisma)

beforeEach(async () => {
  mockedEmbed.mockReset()
  mockedEmbed.mockResolvedValue(unitVector(0))
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('embedRecipeById', () => {
  it('persists a vector whose signature reflects the recipe current semantic fields', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id, {
      name: 'Carbonara',
      description: 'Roman pasta',
      cuisine: 'Italian',
      flavorTags: ['Savory'],
      mainIngredients: ['Egg', 'Pancetta'],
      techniques: ['Emulsify']
    })

    await embedRecipeById(recipe.id, user.id, testPrisma)

    const rows = await testPrisma.$queryRawUnsafe<
      Array<{ recipeId: string; userId: string; signature: string }>
    >(
      'SELECT "recipeId", "userId", "signature" FROM "RecipeVector" WHERE "recipeId" = $1',
      recipe.id
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].userId).toBe(user.id)
    expect(rows[0].signature).toBe(
      vectorAccess.buildSignatureFromRecipe(recipe)
    )
  })

  it('updates the existing vector in place when re-invoked, not duplicating', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id, { name: 'First Name' })

    await embedRecipeById(recipe.id, user.id, testPrisma)

    await testPrisma.recipe.update({
      where: { id: recipe.id },
      data: { name: 'Second Name' }
    })
    await embedRecipeById(recipe.id, user.id, testPrisma)

    const rows = await testPrisma.$queryRawUnsafe<
      Array<{ recipeId: string; signature: string }>
    >(
      'SELECT "recipeId", "signature" FROM "RecipeVector" WHERE "recipeId" = $1',
      recipe.id
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].signature).toBe('second name')
  })

  it('logs and does not throw when the embedding call fails', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)
    mockedEmbed.mockRejectedValue(new Error('OpenAI down'))
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      embedRecipeById(recipe.id, user.id, testPrisma)
    ).resolves.toBeUndefined()

    expect(errorSpy).toHaveBeenCalledWith(
      '[recipe-vector] upsertEmbedding failed',
      expect.objectContaining({ recipeId: recipe.id })
    )

    const rows = await testPrisma.$queryRawUnsafe<Array<{ recipeId: string }>>(
      'SELECT "recipeId" FROM "RecipeVector" WHERE "recipeId" = $1',
      recipe.id
    )
    expect(rows).toHaveLength(0)

    errorSpy.mockRestore()
  })
})
