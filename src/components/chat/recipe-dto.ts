import { cuid } from '~/lib/createId'
import { slugify } from '~/lib/utils'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import type {
  MessageWithRecipes,
  MessageWithRecipesDTO,
  RecipeDTO
} from '~/schemas/chats-schema'
import type { GeneratedRecipe, RecipeDetails } from '~/schemas/messages-schema'

/**
 * A recipe as it arrives from tool-invocation extraction or a live stream.
 * Every field is optional: the model may return a partial recipe mid-stream or
 * on a failed expansion, so the mapper defensively falls back on each field.
 */
export type AnyRecipe = Partial<GeneratedRecipe> & Partial<RecipeDetails>

/**
 * How {@link toRecipeDTOs} assigns each Recipe's `id` and `slug` — the one place
 * the id-precedence rule is expressed instead of an inline comment.
 *
 * - `preserve`: a prior Recipe Option card's id (matched by name) wins over a
 *   freshly minted one, so saving and navigating an expanded card keep working;
 *   a brand-new recipe gets a minted cuid and a slug from its name.
 * - `placeholder`: a mid-stream render that isn't persisted yet, so `id` and
 *   `slug` are empty strings.
 */
export type IdResolution =
  | { kind: 'preserve'; prior: RecipeDTO[] }
  | { kind: 'placeholder' }

/** The shape any Facet source (generated, stored, or prior) exposes. */
type FacetSource = {
  cuisine?: string | null
  course?: string | null
  dietTags?: (string | null)[] | null
  flavorTags?: (string | null)[] | null
  mainIngredients?: (string | null)[] | null
  techniques?: (string | null)[] | null
}

/**
 * Null-coalesce every Facet field to a client-safe default: a `null` scalar or
 * an empty array, with any `null` array element replaced by an empty string.
 *
 * This is the single edit point for the Facet set — adding a Facet field means
 * changing this function and its test, nothing else.
 */
export function facetDefaults(r: FacetSource) {
  return {
    cuisine: r.cuisine ?? null,
    course: r.course ?? null,
    dietTags: r.dietTags?.map((t) => t ?? '') ?? [],
    flavorTags: r.flavorTags?.map((t) => t ?? '') ?? [],
    mainIngredients: r.mainIngredients?.map((i) => i ?? '') ?? [],
    techniques: r.techniques?.map((t) => t ?? '') ?? []
  }
}

/** Resolve one recipe's `id`/`slug` from the {@link IdResolution} strategy. */
function resolveIds(
  name: string,
  idResolution: IdResolution,
  nameToId: Map<string, string> | null
): { id: string; slug: string } {
  if (idResolution.kind === 'placeholder') return { id: '', slug: '' }
  return {
    id: nameToId?.get(name) ?? cuid(),
    slug: name ? slugify(name) : cuid()
  }
}

/**
 * Convert (possibly partial) generated recipes into client {@link RecipeDTO}s,
 * defaulting every Facet, timing, and list field. `idResolution` encodes the
 * card-id-wins precedence rule; it defaults to `preserve` with no prior cards
 * (every recipe gets a freshly minted id).
 */
export function toRecipeDTOs(
  recipes: AnyRecipe[],
  idResolution: IdResolution = { kind: 'preserve', prior: [] }
): RecipeDTO[] {
  const nameToId =
    idResolution.kind === 'preserve'
      ? new Map(idResolution.prior.map((r) => [r.name, r.id]))
      : null

  return recipes.map((recipe) => {
    const name = recipe?.name ?? ''
    const { id, slug } = resolveIds(name, idResolution, nameToId)
    return {
      id,
      name,
      slug,
      description: recipe?.description ?? '',
      ingredients: recipe?.ingredients?.map((i) => i ?? '') ?? [],
      instructions: recipe?.instructions?.map((i) => i ?? '') ?? [],
      prepMinutes: recipe?.prepMinutes ?? null,
      cookMinutes: recipe?.cookMinutes ?? null,
      servings: recipe?.servings ?? null,
      ...facetDefaults(recipe ?? {}),
      saved: false
    }
  })
}

/**
 * Map a stored {@link MessageWithRecipesDTO} (as returned by the Chat query)
 * into the {@link MessageWithRecipes} shape the chat store renders — the one
 * function reload and live-stream reconciliation both reach for, so they cannot
 * drift apart. Ingredients and instructions are flattened to their display
 * strings; Facets go through {@link facetDefaults}.
 */
export function transformStoredMessages(
  data: MessageWithRecipesDTO[]
): MessageWithRecipes[] {
  return data.map((message) => ({
    id: message.id,
    content: message.content,
    role: message.role,
    chatId: message.chatId,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    recipes:
      message.recipes?.map((r) => ({
        id: r.recipe.id,
        name: r.recipe.name,
        description: r.recipe.description ?? null,
        prepMinutes: r.recipe.prepMinutes ?? null,
        cookMinutes: r.recipe.cookMinutes ?? null,
        servings: r.recipe.servings ?? null,
        ...facetDefaults(r.recipe),
        slug: r.recipe.slug ?? '',
        ingredients:
          r.recipe.ingredients?.map((ingredient) =>
            getIngredientDisplayText(ingredient)
          ) ?? [],
        instructions:
          r.recipe.instructions?.map(
            (instruction) => instruction.description
          ) ?? [],
        saved: r.recipe.saved ?? false
      })) ?? []
  }))
}
