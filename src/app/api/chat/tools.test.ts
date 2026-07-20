/**
 * @jest-environment node
 */
import type { ToolExecutionOptions } from 'ai'
import { getTools } from './tools'
import type { ChatContext } from '~/schemas/chats-schema'
import {
  testPrisma,
  truncateAll,
  createTestUser,
  createTestRecipe
} from '~/server/api/test-db'

// editRecipe re-embeds the recipe when a semantic field changes; stub the
// OpenAI embedding call so the pgvector upsert runs without a network round-trip.
jest.mock('~/lib/embeddings', () => ({
  ...jest.requireActual('~/lib/embeddings'),
  embedSignature: jest.fn(async () => new Array(1536).fill(0)),
  embedManySignatures: jest.fn(async () => [])
}))

const recipeDetailContext: ChatContext = {
  page: 'recipe-detail',
  recipe: {
    id: 'placeholder',
    name: 'Placeholder',
    slug: 'placeholder',
    description: null,
    ingredients: [],
    cuisine: null,
    course: null
  }
}

/** Minimal stand-in for the options the AI SDK passes to a tool's execute. */
const execOptions: ToolExecutionOptions = {
  toolCallId: 'test-call',
  messages: []
}

/**
 * Fetch the recipe-detail tool set and narrow it so `editRecipe`/`addNote` are
 * accessible. Throws if the gating unexpectedly withheld them.
 */
function recipeDetailTools(userId?: string) {
  const tools = getTools(recipeDetailContext, testPrisma, userId)
  if (!('editRecipe' in tools)) {
    throw new Error('expected recipe-detail tools to include editRecipe')
  }
  return tools
}

beforeEach(async () => {
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('getTools context gating', () => {
  it('withholds editRecipe/addNote off the recipe-detail page', () => {
    const tools = getTools({ page: 'recipes' }, testPrisma, 'user-1')
    expect('generateRecipeOptions' in tools).toBe(true)
    expect('editRecipe' in tools).toBe(false)
    expect('addNote' in tools).toBe(false)
  })

  it('exposes editRecipe/addNote on the recipe-detail page', () => {
    const tools = getTools(recipeDetailContext, testPrisma, 'user-1')
    expect('editRecipe' in tools).toBe(true)
    expect('addNote' in tools).toBe(true)
  })

  it('withholds recipe-detail tools when no context is provided', () => {
    const tools = getTools(undefined, testPrisma, 'user-1')
    expect('editRecipe' in tools).toBe(false)
    expect('addNote' in tools).toBe(false)
  })
})

describe('editRecipe tool', () => {
  it('renames the recipe, keeping the slug stable like the form path', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id, { name: 'Old Name' })
    const tools = recipeDetailTools(user.id)

    const result = (await tools.editRecipe.execute!(
      { recipeId: recipe.id, newName: 'Roasted Garlic Soup' },
      execOptions
    )) as { success: boolean; recipeName: string; slug: string }

    expect(result.success).toBe(true)
    expect(result.recipeName).toBe('Roasted Garlic Soup')

    const updated = await testPrisma.recipe.findUnique({
      where: { id: recipe.id }
    })
    expect(updated?.name).toBe('Roasted Garlic Soup')
    // The editRecipe use-case (shared with the tRPC form edit) does not mint a
    // new slug on rename, so the URL stays stable — the tool inherits that.
    expect(updated?.slug).toBe(recipe.slug)
    expect(result.slug).toBe(recipe.slug)
  })

  it('replaces the ingredient list wholesale', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)
    await testPrisma.ingredient.create({
      data: { recipeId: recipe.id, rawString: '1 stale onion' }
    })
    const tools = recipeDetailTools(user.id)

    await tools.editRecipe.execute!(
      {
        recipeId: recipe.id,
        newIngredients: ['2 cups flour', '1 tsp salt']
      },
      execOptions
    )

    const ingredients = await testPrisma.ingredient.findMany({
      where: { recipeId: recipe.id },
      orderBy: { id: 'asc' }
    })
    expect(ingredients.map((i) => i.rawString)).toEqual([
      '2 cups flour',
      '1 tsp salt'
    ])
  })

  it('replaces the instruction list wholesale', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)
    await testPrisma.instruction.create({
      data: { recipeId: recipe.id, description: 'Old step' }
    })
    const tools = recipeDetailTools(user.id)

    await tools.editRecipe.execute!(
      {
        recipeId: recipe.id,
        newInstructions: ['Preheat the oven', 'Bake for 20 minutes']
      },
      execOptions
    )

    const instructions = await testPrisma.instruction.findMany({
      where: { recipeId: recipe.id },
      orderBy: { id: 'asc' }
    })
    expect(instructions.map((i) => i.description)).toEqual([
      'Preheat the oven',
      'Bake for 20 minutes'
    ])
  })

  it('fails gracefully when the recipe does not exist', async () => {
    const user = await createTestUser()
    const tools = recipeDetailTools(user.id)

    const result = await tools.editRecipe.execute!(
      { recipeId: 'does-not-exist', newName: 'Ghost Recipe' },
      execOptions
    )

    expect(result).toEqual({ success: false, error: 'Recipe not found' })
  })
})

describe('addNote tool', () => {
  it('sets notes on the recipe and confirms the name', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id, { name: 'Banana Bread' })
    const tools = recipeDetailTools(user.id)

    const result = await tools.addNote.execute!(
      { recipeId: recipe.id, notes: 'Use extra-ripe bananas.' },
      execOptions
    )

    expect(result).toEqual({ success: true, recipeName: 'Banana Bread' })

    const updated = await testPrisma.recipe.findUnique({
      where: { id: recipe.id }
    })
    expect(updated?.notes).toBe('Use extra-ripe bananas.')
  })

  it('fails gracefully when the recipe does not exist', async () => {
    const user = await createTestUser()
    const tools = recipeDetailTools(user.id)

    const result = await tools.addNote.execute!(
      { recipeId: 'does-not-exist', notes: 'Nope' },
      execOptions
    )

    expect(result).toEqual({ success: false, error: 'Recipe not found' })
  })
})
