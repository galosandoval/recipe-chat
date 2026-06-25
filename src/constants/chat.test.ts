import { buildSystemPrompt } from './chat'

type PromptArgs = Parameters<typeof buildSystemPrompt>[0]

const baseArgs = {
  filters: ['vegetarian', 'quick'],
  savedRecipes: ['Carbonara', 'Margherita Pizza']
}

describe('buildSystemPrompt', () => {
  it('never emits near-duplicate dedup/variation steering, even given similar saved recipes', () => {
    // Mirrors how route.ts used to feed RAG matches in. The steering block that
    // hijacked the Generate→expand flow must no longer be produced.
    const args = {
      ...baseArgs,
      similarSaved: [{ name: 'Carbonara', description: 'Roman pasta' }]
    } as PromptArgs

    const prompt = buildSystemPrompt(args)

    expect(prompt).not.toMatch(/already has these saved recipes/i)
    expect(prompt).not.toMatch(/meaningfully different variation/i)
    expect(prompt).not.toMatch(/do not propose duplicates/i)
  })

  it('keeps the generate-vs-expand goals and saved/filter blocks', () => {
    const prompt = buildSystemPrompt(baseArgs)

    expect(prompt).toMatch(/generateRecipes/)
    expect(prompt).toMatch(/expandRecipe/)
    expect(prompt).toContain('vegetarian, quick')
    expect(prompt).toContain('Carbonara | Margherita Pizza')
  })
})
