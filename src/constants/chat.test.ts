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

    expect(prompt).toMatch(/generateRecipeOptions/)
    expect(prompt).toMatch(/expandRecipe/)
    expect(prompt).toContain('vegetarian, quick')
    expect(prompt).toContain('Carbonara | Margherita Pizza')
  })

  it('describes the list page with "shopping list", honoring the glossary', () => {
    const prompt = buildSystemPrompt({
      ...baseArgs,
      context: { page: 'list' }
    } as PromptArgs)

    expect(prompt).toContain('shopping list page')
    expect(prompt).not.toMatch(/grocery list/i)
  })

  describe('hasTasteProfile gate', () => {
    const defaultProfile = {
      cookingSkill: 'intermediate',
      householdSize: 2,
      cuisinePreferences: [] as string[],
      healthGoals: [] as string[],
      dietaryRestrictions: [] as string[]
    }

    const sufficientContext = /Sufficient context is available/i

    it('treats a profile with dietary restrictions but no cuisines as present', () => {
      const prompt = buildSystemPrompt({
        filters: [],
        savedRecipes: [],
        tasteProfile: { ...defaultProfile, dietaryRestrictions: ['vegan'] }
      })
      expect(prompt).toMatch(sufficientContext)
    })

    it('treats a non-default cooking skill as a present profile', () => {
      const prompt = buildSystemPrompt({
        filters: [],
        savedRecipes: [],
        tasteProfile: { ...defaultProfile, cookingSkill: 'advanced' }
      })
      expect(prompt).toMatch(sufficientContext)
    })

    it('does not count a legacy-only "none" dietary restriction as present', () => {
      const prompt = buildSystemPrompt({
        filters: [],
        savedRecipes: [],
        tasteProfile: { ...defaultProfile, dietaryRestrictions: ['none'] }
      })
      expect(prompt).not.toMatch(sufficientContext)
    })

    it('treats an all-default empty profile as absent', () => {
      const prompt = buildSystemPrompt({
        filters: [],
        savedRecipes: [],
        tasteProfile: defaultProfile
      })
      expect(prompt).not.toMatch(sufficientContext)
    })
  })
})
