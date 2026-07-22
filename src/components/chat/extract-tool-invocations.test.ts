import { extractFromToolInvocations } from './extract-tool-invocations'

const optionA = { name: 'Tacos', description: 'Quick tacos' }
const optionB = { name: 'Curry', description: 'Coconut curry' }

const emptyContext = { priorRecipes: [], pendingExpandRecipeId: null }

describe('extractFromToolInvocations — generateRecipeOptions', () => {
  it('prefers the server-side execute result (deduped survivors) over args', () => {
    const { recipes, toolMessage } = extractFromToolInvocations(
      [
        {
          toolName: 'generateRecipeOptions',
          args: { message: 'six raw', recipes: [optionA, optionB] },
          result: { message: 'three unique', recipes: [optionB] }
        }
      ],
      emptyContext
    )

    expect(recipes.map((r) => r.name)).toEqual(['Curry'])
    expect(toolMessage).toBe('three unique')
  })

  it('renders no cards from args while streaming (avoids the over-generated count flashing then collapsing)', () => {
    const { recipes, toolMessage } = extractFromToolInvocations(
      [
        {
          toolName: 'generateRecipeOptions',
          args: { message: 'streaming', recipes: [optionA, optionB] }
        }
      ],
      emptyContext
    )

    // No result yet → no cards shown, but the intro message renders immediately.
    expect(recipes).toEqual([])
    expect(toolMessage).toBe('streaming')
  })

  it('returns nothing when there is no options tool call', () => {
    const { recipes, toolMessage, clearPendingExpandId } =
      extractFromToolInvocations([], emptyContext)

    expect(recipes).toEqual([])
    expect(toolMessage).toBe('')
    expect(clearPendingExpandId).toBe(false)
  })
})

describe('extractFromToolInvocations — expandRecipe', () => {
  const priorCurry = {
    id: 'curry-card-id',
    name: 'Curry',
    description: 'Coconut curry',
    cuisine: 'thai',
    course: 'main',
    dietTags: ['vegan'],
    flavorTags: ['spicy'],
    mainIngredients: ['chickpeas'],
    techniques: ['simmer']
  }

  const validDetails = {
    ingredients: ['400ml coconut milk', '1 can chickpeas'],
    instructions: ['Simmer everything', 'Serve over rice'],
    servings: 4
  }

  it('merges details into the prior suggestion matched by name and keeps its facets', () => {
    const { recipes, toolMessage, clearPendingExpandId } =
      extractFromToolInvocations(
        [
          {
            toolName: 'expandRecipe',
            args: {
              recipeName: 'Curry',
              details: validDetails,
              message: 'Here you go'
            }
          }
        ],
        { priorRecipes: [priorCurry], pendingExpandRecipeId: null }
      )

    expect(recipes).toHaveLength(1)
    expect(recipes[0].name).toBe('Curry')
    expect(recipes[0].cuisine).toBe('thai')
    expect(recipes[0].ingredients).toEqual(validDetails.ingredients)
    expect(recipes[0].instructions).toEqual(validDetails.instructions)
    expect(recipes[0].servings).toBe(4)
    expect(toolMessage).toBe('Here you go')
    expect(clearPendingExpandId).toBe(true)
  })

  it('falls back to the tapped card (pendingExpandRecipeId) when no name matches', () => {
    const { recipes, clearPendingExpandId } = extractFromToolInvocations(
      [{ toolName: 'expandRecipe', args: { details: validDetails } }],
      { priorRecipes: [priorCurry], pendingExpandRecipeId: 'curry-card-id' }
    )

    expect(recipes).toHaveLength(1)
    expect(recipes[0].name).toBe('Curry')
    expect(clearPendingExpandId).toBe(true)
  })

  it('drops the merge when no prior recipe matches, still clearing the pending id', () => {
    const { recipes, toolMessage, clearPendingExpandId } =
      extractFromToolInvocations(
        [
          {
            toolName: 'expandRecipe',
            args: {
              recipeName: 'Unknown',
              details: validDetails,
              message: 'hi'
            }
          }
        ],
        { priorRecipes: [priorCurry], pendingExpandRecipeId: null }
      )

    expect(recipes).toEqual([])
    expect(toolMessage).toBe('hi')
    expect(clearPendingExpandId).toBe(true)
  })

  it('does not clear the pending id when the model returned incomplete details', () => {
    const { recipes, clearPendingExpandId } = extractFromToolInvocations(
      [
        {
          toolName: 'expandRecipe',
          args: {
            recipeName: 'Curry',
            details: { ingredients: [], instructions: [], servings: 4 },
            message: 'oops'
          }
        }
      ],
      { priorRecipes: [priorCurry], pendingExpandRecipeId: null }
    )

    expect(recipes).toEqual([])
    expect(clearPendingExpandId).toBe(false)
  })
})
