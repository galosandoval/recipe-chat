import type { ChatContext } from '~/schemas/chats-schema'

export const buildSystemPrompt = ({
  filters,
  savedRecipes,
  pantrySummary = [],
  context
}: {
  filters: string[]
  savedRecipes: string[]
  pantrySummary?: string[]
  context?: ChatContext
}) => {
  const hasFilters = (filters?.length ?? 0) > 0
  const hasPantry = (pantrySummary?.length ?? 0) > 0

  let contextBlock = ''
  if (context?.page === 'recipe-detail') {
    const r = context.recipe
    const parts = [`The user is viewing a specific recipe: "${r.name}".`]
    if (r.description) parts.push(`Description: ${r.description}`)
    if (r.ingredients.length > 0)
      parts.push(`Ingredients: ${r.ingredients.join(', ')}`)
    if (r.cuisine) parts.push(`Cuisine: ${r.cuisine}`)
    if (r.course) parts.push(`Course: ${r.course}`)
    parts.push(
      'Answer questions about this recipe — substitutions, technique tips, scaling, nutrition, pairings, etc.'
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
- Return a helpful message + 0–5 recipes.
- If >1 recipe: name + 1–2 sentence description only.
- If exactly 1 recipe: include fields required by the schema.

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
${contextBlock ? `\n${contextBlock}\n` : ''}- Vary cuisines unless constrained by filters or an explicit user preference.
- Avoid duplicates and avoid already-saved items (see "Saved" below).
- When responding with one recipe, include all the fields required by the schema.

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
