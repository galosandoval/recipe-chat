import { facetDefaults } from './recipe-dto'
import type {
  FullRecipe,
  GeneratedRecipe,
  RecipeDetails
} from '~/schemas/messages-schema'

type AnyRecipe = GeneratedRecipe & Partial<RecipeDetails>

/**
 * A recipe surfaced earlier in the chat (a rendered Recipe Option card or an
 * already-expanded Recipe), used to resolve which suggestion an `expandRecipe`
 * call is filling in and to carry its facets into the merge.
 */
export type PriorRecipe = {
  id: string
  name: string
  description?: string | null
  prepMinutes?: number | null
  cookMinutes?: number | null
  cuisine?: string | null
  course?: string | null
  dietTags?: string[]
  flavorTags?: string[]
  mainIngredients?: string[]
  techniques?: string[]
}

type ToolInvocationLite = {
  toolName: string
  args?: Record<string, unknown>
  result?: unknown
}

/**
 * The recipes and intro message a chat assistant message should render, plus
 * whether the caller should clear the pending-expand id now that the expand
 * turn resolved.
 */
export type ExtractedTurn = {
  recipes: AnyRecipe[]
  toolMessage: string
  /**
   * True once an `expandRecipe` call with complete details has been resolved
   * (whether or not a matching prior suggestion was found) — the caller should
   * clear the pending-expand id. False while streaming or on incomplete
   * details, so a retry can still reuse the tapped card.
   */
  clearPendingExpandId: boolean
}

/**
 * Derive the recipes and intro message a chat assistant message should render
 * from its tool invocations. Pure — the caller supplies the prior recipes and
 * the pending-expand id and applies any resulting side effects. Handles the two
 * recipe tools:
 * - `expandRecipe`: merges the returned details into the matching prior
 *   suggestion, resolved by name first, then by the tapped card
 *   (`pendingExpandRecipeId`) — the tapped card wins over a name lookup miss.
 * - `generateRecipeOptions`: prefers the server-side execute result (the
 *   de-duplicated survivors), falling back to args while streaming or if the
 *   execute failed open.
 */
export function extractFromToolInvocations(
  toolInvocations: ToolInvocationLite[] | undefined,
  context: { priorRecipes: PriorRecipe[]; pendingExpandRecipeId: string | null }
): ExtractedTurn {
  const empty: ExtractedTurn = {
    recipes: [],
    toolMessage: '',
    clearPendingExpandId: false
  }
  if (!toolInvocations) return empty

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
    const message = args.message ?? ''
    const d = args.details
    if (d?.ingredients?.length && d?.instructions?.length) {
      const { priorRecipes, pendingExpandRecipeId } = context
      const existing =
        (args.recipeName
          ? priorRecipes.find((r) => r.name === args.recipeName)
          : undefined) ??
        priorRecipes.find((r) => r.id === pendingExpandRecipeId)

      // No prior recipe to expand — drop the malformed merge and show only the
      // message. Still clear the pending id: the expand turn is over.
      if (!existing) {
        return { recipes: [], toolMessage: message, clearPendingExpandId: true }
      }

      const merged: FullRecipe = {
        name: existing.name,
        description: existing.description ?? '',
        prepMinutes: existing.prepMinutes ?? null,
        cookMinutes: existing.cookMinutes ?? null,
        ...facetDefaults(existing),
        ingredients: d.ingredients,
        instructions: d.instructions,
        servings: d.servings
      }
      return {
        recipes: [merged],
        toolMessage: message,
        clearPendingExpandId: true
      }
    }
    return { recipes: [], toolMessage: message, clearPendingExpandId: false }
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
  if (!generateCall) return empty
  const result = generateCall.result as
    | { recipes?: GeneratedRecipe[]; message?: string }
    | undefined
  const args = generateCall.args as { message?: string } | undefined
  return {
    recipes: result?.recipes ?? [],
    toolMessage: result?.message ?? args?.message ?? '',
    clearPendingExpandId: false
  }
}
