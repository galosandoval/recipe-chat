import { chatsAccess, ChatsAccess } from '~/server/api/data-access/chats-access'
import { type z } from 'zod'
import {
  chatContextToScope,
  type ChatContext,
  type Generated,
  type MessagesWithRecipes,
  type messagesWithRecipesSchema
} from '~/schemas/chats-schema'
import { RecipesAccess } from '../data-access/recipes-access'
import { RecipesOnMessagesAccess } from '../data-access/recipes-on-messages-access'
import { embedRecipeById } from './embed-recipe-use-case'
import { MessagesAccess } from '../data-access/messages-access'
import { transaction } from '../data-access/data-access'
import { CHAT_FRESHNESS_MS } from '~/constants/chat'
import { cuid } from '~/lib/createId'

/** True when a chat with this `updatedAt` is still within the freshness window. */
function isFresh(updatedAt: Date) {
  return Date.now() - updatedAt.getTime() <= CHAT_FRESHNESS_MS
}

async function embedMessageRecipes(
  messages: MessagesWithRecipes,
  userId: string
) {
  const recipes = messages.flatMap((m) => m.recipes ?? [])
  await Promise.all(recipes.map((recipe) => embedRecipeById(recipe.id, userId)))
}

/**
 * Retrieves a user's chats for a single Chat Context (browse-history view — no
 * freshness filtering).
 */
export async function getChats(userId: string, context?: ChatContext) {
  return await chatsAccess.getChatsByUserId(userId, chatContextToScope(context))
}

/**
 * The chat to auto-resume on entering a Chat Context: the most recent chat for
 * that context, but only if it's still within the freshness window. Returns
 * `null` when there's no chat for the context or the most recent one is stale.
 */
export async function getResumableChat(userId: string, context?: ChatContext) {
  const chat = await chatsAccess.getMostRecentChat(
    userId,
    chatContextToScope(context)
  )
  if (!chat || !isFresh(chat.updatedAt)) return null
  return chat
}

/**
 * Retrieves all messages for a specific chat
 */
export async function getMessagesById(chatId: string) {
  return await chatsAccess.getMessagesByChatId(chatId)
}

/**
 * A Chat Context's resume state resolved in one call: the resumable chat plus
 * its messages. Callers always need both together (see {@link ResumeChatSeed}),
 * and resolving them here collapses what would otherwise be a two-round-trip
 * waterfall on the pages that seed the client cache.
 */
export async function getResumableChatWithMessages(
  userId: string,
  context?: ChatContext
) {
  const chat = await chatsAccess.getMostRecentChatWithMessages(
    userId,
    chatContextToScope(context)
  )
  if (!chat || !isFresh(chat.updatedAt)) {
    return { resumable: null, messages: null }
  }

  // Split the single row back into the two shapes the client seeds under
  // `chats.getResumableChat` and `chats.getMessagesById`, so a later client
  // refetch of either key returns the same shape it was seeded with.
  const { messages, ...resumable } = chat
  return { resumable, messages: { ...resumable, messages } }
}

/**
 * Upserts a chat by either adding messages to an existing chat or creating a new one
 */
export async function upsertChat(
  chatId: string | undefined,
  messages: z.infer<typeof messagesWithRecipesSchema>,
  userId: string,
  context?: ChatContext,
  filterIds?: string[]
) {
  if (chatId) {
    // Only append if the target chat still exists and is fresh. A chat that's
    // gone stale is never appended to again — start a new one scoped to the
    // same context instead (returning its id so the client adopts it).
    const existing = await chatsAccess.getChatById(chatId)
    if (existing && isFresh(existing.updatedAt)) {
      await chatsAccess.addMessages(chatId, messages, userId)

      await embedMessageRecipes(messages, userId)

      return {
        success: true,
        message: 'successfully added messages'
      } as const
    }
  }

  // Create new chat with all messages, scoped to the current context.
  const scope = chatContextToScope(context)
  const newChat = await chatsAccess.createChatWithMessages({
    userId,
    messages,
    filterIds,
    page: scope.page,
    recipeId: scope.recipeId
  })

  await embedMessageRecipes(messages, userId)

  return {
    success: true,
    message: 'successfully created a chat',
    chatId: newChat.id
  } as const
}

/**
 * Processes a generated recipe by updating the recipe with ingredients and instructions,
 * creating associated messages, and establishing the recipe-message relationship
 */
export async function generated(data: Generated, userId: string) {
  const { prompt, generated } = data
  const {
    id,
    name,
    ingredients,
    content,
    instructions,
    messageId,
    chatId: requestedChatId,
    ...rest
  } = generated

  // Re-check the requested chat's freshness. If it's gone stale, don't append —
  // start a new chat scoped to the same context. The effective id is returned so
  // the client adopts it instead of trusting its pre-minted cuid.
  const existing = await chatsAccess.getChatById(requestedChatId)
  const isStale = !!existing && !isFresh(existing.updatedAt)
  const chatId = isStale ? cuid() : requestedChatId
  // No row yet for this id: either the client minted it, or we just minted a
  // replacement for a stale chat.
  const isNewChat = !existing || isStale
  const scope = chatContextToScope(data.context)

  await transaction(async (tx) => {
    const chats = new ChatsAccess(tx)
    if (isNewChat) {
      await chats.createChatShell(chatId, userId, scope)
    } else {
      await chats.touchChat(chatId)
    }

    // Upsert recipe — create if it doesn't exist yet, update if it does
    await new RecipesAccess(tx).upsertRecipeWithIngredientsAndInstructions(id, {
      ...rest,
      name,
      userId,
      ingredients,
      instructions
    })

    // Create messages
    await new MessagesAccess(tx).createMessages([
      { ...prompt, role: 'user', chatId },
      {
        content,
        id: messageId,
        role: 'assistant',
        chatId
      }
    ])

    // Create recipe-message relationship
    await new RecipesOnMessagesAccess(tx).create(id, messageId)
  })

  await embedRecipeById(id, userId)

  return {
    success: true,
    message: 'successfully created a recipe',
    chatId
  } as const
}
