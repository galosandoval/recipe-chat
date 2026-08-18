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

  it('describes the list page with "grocery list", honoring the glossary', () => {
    const prompt = buildSystemPrompt({
      ...baseArgs,
      context: { page: 'list' }
    } as PromptArgs)

    expect(prompt).toContain('grocery list page')
    expect(prompt).not.toMatch(/shopping list/i)
  })

  describe('first visit (no filters, no profile, no saved recipes)', () => {
    // The exact payload route.ts builds for a brand-new visitor: no userId, so
    // tasteProfile is null and every list is empty. This turn must still return
    // recipe cards — clicking the welcome CTA is the first thing a user does,
    // and asking them questions instead is the whole bug.
    const firstVisit = { filters: [], savedRecipes: [] }

    it('never instructs the model to ask clarifying questions or stall', () => {
      const prompt = buildSystemPrompt(firstVisit)

      expect(prompt).not.toMatch(/ask 1–3/i)
      expect(prompt).not.toMatch(/clarifying questions,/i)
      expect(prompt).not.toMatch(/wait for the reply/i)
    })

    it('instructs the model to propose recipes anyway', () => {
      const prompt = buildSystemPrompt(firstVisit)

      expect(prompt).toMatch(/NEVER ask clarifying questions/i)
      expect(prompt).toMatch(/open brief/i)
      expect(prompt).toMatch(/generateRecipeOptions/)
    })
  })

  it.each([
    ['no context', { filters: [], savedRecipes: [] }],
    ['filters only', { filters: ['vegetarian'], savedRecipes: [] }]
  ])('carries the never-ask rule with %s', (_label, args) => {
    expect(buildSystemPrompt(args)).toMatch(/NEVER ask clarifying questions/i)
  })

  // This gate only picks which steering the prompt uses — context-matched vs.
  // open-brief. It never decides *whether* to answer: both branches propose
  // recipes on the first turn. "Absent" here means "nothing to match against",
  // not "too little to work with".
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
