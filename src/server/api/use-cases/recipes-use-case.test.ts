/**
 * @jest-environment node
 */
import {
  editRecipe,
  createRecipeWithEmbedding
} from '~/server/api/use-cases/recipes-use-case'
import type { UpdateRecipe } from '~/schemas/recipes-schema'
import { embedSignature } from '~/lib/embeddings'
import {
  testPrisma,
  truncateAll,
  createTestUser,
  createTestRecipe
} from '~/server/api/test-db'

// Only the OpenAI embedding call is mocked; the rest runs against the test DB.
jest.mock('~/lib/embeddings', () => ({
  ...jest.requireActual('~/lib/embeddings'),
  embedSignature: jest.fn()
}))

const mockedEmbed = embedSignature as jest.MockedFunction<typeof embedSignature>

// Build an UpdateRecipe that touches nothing but the supplied overrides. newName
// mirrors the existing name so only the intended field counts as changed.
function editFor(
  recipe: { id: string; name: string },
  overrides: Partial<UpdateRecipe>
): UpdateRecipe {
  return {
    id: recipe.id,
    name: recipe.name,
    newName: recipe.name,
    newIngredients: [],
    newInstructions: [],
    ingredients: [],
    instructions: [],
    ...overrides
  }
}

beforeEach(async () => {
  mockedEmbed.mockReset()
  mockedEmbed.mockResolvedValue(new Array(1536).fill(0))
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('editRecipe facet edits', () => {
  it('updates the facet row and re-embeds when a facet changes', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id, { name: 'Pasta' })

    await editRecipe(editFor(recipe, { newCuisine: 'italian' }), user.id, testPrisma)

    const row = await testPrisma.recipe.findUnique({ where: { id: recipe.id } })
    expect(row?.cuisine).toBe('italian')
    expect(mockedEmbed).toHaveBeenCalledTimes(1)
  })

  it('updates array facets and re-embeds', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id, { name: 'Pasta' })

    await editRecipe(
      editFor(recipe, { newDietTags: ['vegan', 'gluten-free'] }),
      user.id,
      testPrisma
    )

    const row = await testPrisma.recipe.findUnique({ where: { id: recipe.id } })
    expect(row?.dietTags).toEqual(['vegan', 'gluten-free'])
    expect(mockedEmbed).toHaveBeenCalledTimes(1)
  })

  it('does not re-embed when only a non-semantic field (notes) changes', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id, { name: 'Pasta' })

    await editRecipe(
      editFor(recipe, { notes: '', newNotes: 'serve hot' }),
      user.id,
      testPrisma
    )

    const row = await testPrisma.recipe.findUnique({ where: { id: recipe.id } })
    expect(row?.notes).toBe('serve hot')
    expect(mockedEmbed).not.toHaveBeenCalled()
  })
})

describe('createRecipeWithEmbedding facet persistence', () => {
  it('persists facets supplied to a manually created recipe', async () => {
    const user = await createTestUser()

    const created = await createRecipeWithEmbedding(
      {
        name: 'Manual Carbonara',
        ingredients: ['eggs', 'pancetta'],
        instructions: ['emulsify'],
        cuisine: 'italian',
        course: 'dinner',
        dietTags: ['high-protein'],
        flavorTags: ['savory'],
        mainIngredients: ['egg', 'pancetta'],
        techniques: ['emulsify']
      },
      user.id,
      testPrisma
    )

    const row = await testPrisma.recipe.findUnique({
      where: { id: created.id }
    })

    expect(row).toMatchObject({
      cuisine: 'italian',
      course: 'dinner',
      dietTags: ['high-protein'],
      flavorTags: ['savory'],
      mainIngredients: ['egg', 'pancetta'],
      techniques: ['emulsify']
    })
  })
})
