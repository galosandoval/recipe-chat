import { cuid } from '~/lib/createId'
import { type AnyRecipe, toRecipeDTOs } from './recipe-dto'
import type { MessageWithRecipes, RecipeDTO } from '~/schemas/chats-schema'
import type { UpsertChatSchema } from '~/schemas/chats-schema'

type ToolInvocationLite = { toolName: string; result?: unknown }

/**
 * The set of recipes visible before this turn's trailing assistant placeholder.
 * The placeholder (a streaming or just-finished assistant message) is excluded
 * so that a Recipe Option card's id — persisted to the DB — wins over an id
 * freshly minted for the streamed reply.
 */
export function priorRecipes(messages: MessageWithRecipes[]): RecipeDTO[] {
  const last = messages.at(-1)
  const scanned = last?.role === 'assistant' ? messages.slice(0, -1) : messages
  return scanned.flatMap((m) => m.recipes)
}

/**
 * Reconcile a streamed or finished assistant turn into the messages list. The
 * trailing assistant placeholder — kept last as an invariant — is updated in
 * place (preserving its id); otherwise a new assistant message is appended.
 */
export function reconcileAssistantMessage(
  messages: MessageWithRecipes[],
  input: {
    content: string
    recipes: AnyRecipe[]
    toolInvocations?: MessageWithRecipes['toolInvocations']
    chatId: string
  }
): MessageWithRecipes[] {
  const recipes = toRecipeDTOs(input.recipes, {
    kind: 'preserve',
    prior: priorRecipes(messages)
  })
  const last = messages.at(-1)

  if (last?.role === 'assistant') {
    const updated: MessageWithRecipes = {
      ...last,
      content: input.content,
      recipes,
      toolInvocations: input.toolInvocations
    }
    return [...messages.slice(0, -1), updated]
  }

  const assistantMessage: MessageWithRecipes = {
    id: cuid(),
    content: input.content,
    role: 'assistant',
    createdAt: new Date(),
    updatedAt: new Date(),
    chatId: input.chatId,
    recipes,
    toolInvocations: input.toolInvocations
  }
  return [...messages, assistantMessage]
}

/**
 * A "Generate" click forces the `expandRecipe` tool. When the model returns no
 * usable recipe (incomplete details, or a name matching no prior suggestion),
 * the turn is dead and should be rolled back rather than persisted.
 */
export function isFailedExpand(
  toolInvocations: ToolInvocationLite[] | undefined,
  recipes: AnyRecipe[]
): boolean {
  const isExpand = toolInvocations?.some((t) => t.toolName === 'expandRecipe')
  return !!isExpand && recipes.length === 0
}

/**
 * Revert the trailing user-prompt + assistant placeholder of a dead expand so
 * the suggestion card stays available to retry and no recipe-less bubble is
 * persisted.
 */
export function rollbackExpand(
  messages: MessageWithRecipes[]
): MessageWithRecipes[] {
  let end = messages.length
  if (messages[end - 1]?.role === 'assistant') end--
  if (messages[end - 1]?.role === 'user') end--
  return messages.slice(0, end)
}

/**
 * Find the id of a prior suggestion whose name matches the reconciled recipe —
 * the card the user tapped Generate on. Its presence means the turn expanded an
 * existing suggestion (record it) rather than proposing new options (upsert).
 */
export function findExpandedRecipeId(
  messages: MessageWithRecipes[],
  recipeName: string | undefined
): string | undefined {
  return priorRecipes(messages).find((r) => r.name === recipeName)?.id
}

/**
 * Whether a server-side recipe mutation (editRecipe/addNote) succeeded, so the
 * caller can invalidate the recipe-detail view that reads through the tRPC
 * cache the tool bypassed.
 */
export function didMutateRecipe(
  toolInvocations: ToolInvocationLite[] | undefined
): boolean {
  return !!toolInvocations?.some(
    (t) =>
      (t.toolName === 'editRecipe' || t.toolName === 'addNote') &&
      (t.result as { success?: boolean } | undefined)?.success
  )
}

/**
 * Build the upsert payload for the last two messages of a turn (the user prompt
 * and the assistant reply), dropping recipes with no name or description.
 */
export function buildUpsertMessages(
  lastTwoMessages: MessageWithRecipes[]
): UpsertChatSchema['messages'] {
  return lastTwoMessages.map((m) => ({
    id: m.id,
    content: m.content,
    role: m.role,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    recipes: m.recipes
      .filter(
        (r) =>
          r.name.trim().length > 0 && (r.description ?? '').trim().length > 0
      )
      .map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description ?? '',
        servings: r.servings ?? null,
        ingredients: r.ingredients,
        instructions: r.instructions,
        prepMinutes: r.prepMinutes,
        cookMinutes: r.cookMinutes,
        cuisine: r.cuisine,
        course: r.course,
        dietTags: r.dietTags,
        flavorTags: r.flavorTags,
        mainIngredients: r.mainIngredients,
        techniques: r.techniques
      }))
  }))
}

/**
 * Whether the reconciled turn is worth persisting — the assistant produced some
 * content or at least one meaningful recipe. Skips saving an empty reply.
 */
export function turnHasContentToPersist(
  upsertMessages: UpsertChatSchema['messages']
): boolean {
  return upsertMessages.some(
    (m) =>
      m.role === 'assistant' && (m.recipes.length > 0 || m.content.length > 0)
  )
}
