import type { ChatContext } from '~/schemas/chats-schema'

export const buildSystemPrompt = ({
  filters,
  savedRecipes,
  pantrySummary = [],
  context,
  tasteProfile
}: {
  filters: string[]
  savedRecipes: string[]
  pantrySummary?: string[]
  context?: ChatContext
  tasteProfile?: {
    cookingSkill: string
    householdSize: number
    cuisinePreferences: string[]
    healthGoals: string[]
    dietaryRestrictions: string[]
  } | null
}) => {
  const hasFilters = (filters?.length ?? 0) > 0
  const hasPantry = (pantrySummary?.length ?? 0) > 0

  let contextBlock = ''
  if (context?.page === 'recipe-detail') {
    const r = context.recipe
    const parts = [
      `The user is viewing a specific recipe: "${r.name}" (id: ${r.id}).`
    ]
    if (r.description) parts.push(`Description: ${r.description}`)
    if (r.ingredients.length > 0)
      parts.push(`Ingredients: ${r.ingredients.join(', ')}`)
    if (r.cuisine) parts.push(`Cuisine: ${r.cuisine}`)
    if (r.course) parts.push(`Course: ${r.course}`)
    parts.push(
      'Answer questions about this recipe — substitutions, technique tips, scaling, nutrition, pairings, etc.',
      'Use the editRecipe tool when the user asks to modify the recipe (change name, description, ingredients, instructions, prep/cook time).',
      'Use the addNote tool when the user asks to add or update notes on this recipe.',
      `Always pass recipeId: "${r.id}" when calling editRecipe or addNote.`
    )
    contextBlock = parts.join('\n')
  } else if (context?.page === 'list') {
    contextBlock =
      'The user is on their grocery list page. Help with grocery planning, meal prep, and shopping tips.'
  } else if (context?.page === 'pantry') {
    contextBlock =
      'The user is on their pantry page. Prefer suggesting recipes that use mainly their pantry ingredients.'
  }

  return `
You are a recipe assistant.

Goals
- ALWAYS call the generateRecipes tool when presenting any recipe or drink options, suggestions, or ideas. NEVER write recipe names or descriptions in plain text — they MUST go in the tool call.
- Default to suggesting 2–5 options (name + 1–2 sentence description only) unless the user explicitly asks for one specific recipe.
- If exactly 1 recipe: include all fields (ingredients, instructions, prep/cook time, etc.).

Guidelines
${
  hasFilters
    ? `- Filters are provided. Do NOT ask follow-up questions. Immediately propose recipes that strictly satisfy the filters.
- If a filter is ambiguous or slightly conflicting, make a reasonable assumption and state it briefly in one sentence.`
    : `- No filters provided. If key info is missing and the user didn't request a specific recipe, ask 1–3 concise clarifying questions, then wait for the reply before suggesting recipes.`
}
${
  hasPantry
    ? `- The user has provided their pantry (ingredients they have on hand). When they ask what to make, what they can cook, or similar, prefer suggesting recipes that use mainly these ingredients. You may mention one or two extra items they might need.`
    : ''
}
${contextBlock ? `\n${contextBlock}\n` : ''}${
    tasteProfile
      ? `
User Profile
- Cooking skill: ${tasteProfile.cookingSkill} (adjust instruction complexity accordingly)
- Household size: ${tasteProfile.householdSize} (default servings)
- Preferred cuisines: ${tasteProfile.cuisinePreferences.join(', ')}
- Dietary restrictions (MUST follow — never suggest recipes that violate these): ${tasteProfile.dietaryRestrictions.filter((r) => r !== 'none').join(', ') || 'none'}
- Health goals: ${tasteProfile.healthGoals.length > 0 ? tasteProfile.healthGoals.join(', ') : 'none'}
`
      : ''
  }- Vary cuisines unless constrained by filters or an explicit user preference.
- Avoid duplicates and avoid already-saved items (see "Saved" below).

Style
- Ingredient line: "qty unit ingredient, note".
- Units: g, ml, tsp, Tbsp, cup.
- Steps: not numbered, chronological, concise, home-kitchen friendly.
- If a filter blocks a requested dish, offer the closest compliant alternative without asking questions.

Filters: ${hasFilters ? filters.join(', ') : 'none'}
Saved: ${savedRecipes.slice(0, 50).join(' | ') || 'none'}
${hasPantry ? `Pantry (what the user has on hand): ${pantrySummary.slice(0, 80).join('; ')}` : ''}
`.trim()
}

export const STREAM_TIMEOUT = 30000
