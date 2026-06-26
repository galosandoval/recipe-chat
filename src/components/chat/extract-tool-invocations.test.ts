import { extractFromToolInvocations } from './extract-tool-invocations'

const optionA = { name: 'Tacos', description: 'Quick tacos' }
const optionB = { name: 'Curry', description: 'Coconut curry' }

describe('extractFromToolInvocations — generateRecipeOptions', () => {
  it('prefers the server-side execute result (deduped survivors) over args', () => {
    const { recipes, toolMessage } = extractFromToolInvocations([
      {
        toolName: 'generateRecipeOptions',
        args: { message: 'six raw', recipes: [optionA, optionB] },
        result: { message: 'three unique', recipes: [optionB] }
      }
    ])

    expect(recipes.map((r) => r.name)).toEqual(['Curry'])
    expect(toolMessage).toBe('three unique')
  })

  it('renders no cards from args while streaming (avoids the over-generated count flashing then collapsing)', () => {
    const { recipes, toolMessage } = extractFromToolInvocations([
      {
        toolName: 'generateRecipeOptions',
        args: { message: 'streaming', recipes: [optionA, optionB] }
      }
    ])

    // No result yet → no cards shown, but the intro message renders immediately.
    expect(recipes).toEqual([])
    expect(toolMessage).toBe('streaming')
  })

  it('returns nothing when there is no options tool call', () => {
    const { recipes, toolMessage } = extractFromToolInvocations([])

    expect(recipes).toEqual([])
    expect(toolMessage).toBe('')
  })
})
