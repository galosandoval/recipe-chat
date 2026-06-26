import { useChatStore } from '~/stores/chat-store'
import type {
  FullRecipe,
  GeneratedRecipe,
  RecipeDetails
} from '~/schemas/messages-schema'

type AnyRecipe = GeneratedRecipe & Partial<RecipeDetails>

/**
 * Derive the recipes and intro message a chat assistant message should render
 * from its tool invocations. Handles the two recipe tools:
 * - `expandRecipe`: merges the returned details into the matching prior suggestion.
 * - `generateRecipeOptions`: prefers the server-side execute result (the
 *   de-duplicated survivors), falling back to args while streaming or if the
 *   execute failed open.
 */
export function extractFromToolInvocations(
  toolInvocations:
    | Array<{
        toolName: string
        args?: Record<string, unknown>
        result?: unknown
      }>
    | undefined,
  isFinal = false
): { recipes: AnyRecipe[]; toolMessage: string } {
  if (!toolInvocations) return { recipes: [], toolMessage: '' }

  // Handle expandRecipe (single recipe expansion — merges with pending suggestion)
  const expandCall = toolInvocations.find(
    (t) => t.toolName === 'expandRecipe' && 'args' in t
  )
  if (expandCall?.args) {
    const args = expandCall.args as {
      recipeName?: string
      details?: RecipeDetails
      message?: string
    }
    const d = args.details
    if (d?.ingredients?.length && d?.instructions?.length) {
      const store = useChatStore.getState()
      const allPriorRecipes = store.messages.flatMap((m) => m.recipes)
      const existing =
        (args.recipeName
          ? allPriorRecipes.find((r) => r.name === args.recipeName)
          : undefined) ??
        allPriorRecipes.find((r) => r.id === store.pendingExpandRecipeId)
      if (isFinal) {
        store.setPendingExpandRecipeId(null)
      }

      // No prior recipe to expand — drop the malformed merge and show only the message.
      if (!existing) {
        return { recipes: [], toolMessage: args.message ?? '' }
      }

      const merged: FullRecipe = {
        name: existing.name,
        description: existing.description ?? '',
        prepMinutes: existing.prepMinutes ?? null,
        cookMinutes: existing.cookMinutes ?? null,
        cuisine: existing.cuisine ?? null,
        course: existing.course ?? null,
        dietTags: existing.dietTags ?? [],
        flavorTags: existing.flavorTags ?? [],
        mainIngredients: existing.mainIngredients ?? [],
        techniques: existing.techniques ?? [],
        ingredients: d.ingredients,
        instructions: d.instructions,
        servings: d.servings
      }
      return { recipes: [merged], toolMessage: args.message ?? '' }
    }
    return {
      recipes: [],
      toolMessage: (expandCall.args as { message?: string }).message ?? ''
    }
  }

  // Handle generateRecipeOptions (multi-recipe suggestions). Render cards ONLY
  // from the server-side execute result (the de-duplicated survivors) — never
  // from args. The model over-generates ~6 options that args would expose; if
  // we rendered those mid-stream the cards would visibly collapse to the 3
  // deduped survivors when the result lands. Showing nothing until the result
  // arrives keeps the count stable. The intro message can still come from args
  // so the bubble isn't empty while the options stream in.
  const generateCall = toolInvocations.find(
    (t) => t.toolName === 'generateRecipeOptions'
  )
  if (!generateCall) return { recipes: [], toolMessage: '' }
  const result = generateCall.result as
    | { recipes?: GeneratedRecipe[]; message?: string }
    | undefined
  const args = generateCall.args as { message?: string } | undefined
  return {
    recipes: result?.recipes ?? [],
    toolMessage: result?.message ?? args?.message ?? ''
  }
}
