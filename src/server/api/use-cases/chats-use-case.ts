import { type PrismaClient } from '@prisma/client'
import { ChatsAccess } from '~/server/api/data-access/chats-access'
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
import { CHAT_FRESHNESS_MS } from '~/constants/chat'
import { cuid } from '~/lib/createId'

/** True when a chat with this `updatedAt` is still within the freshness window. */
function isFresh(updatedAt: Date) {
  return Date.now() - updatedAt.getTime() <= CHAT_FRESHNESS_MS
}

async function embedMessageRecipes(
  messages: MessagesWithRecipes,
  userId: string,
  prisma: PrismaClient
) {
  const recipes = messages.flatMap((m) => m.recipes ?? [])
  await Promise.all(
    recipes.map((recipe) => embedRecipeById(recipe.id, userId, prisma))
  )
}

/**
 * Retrieves a user's chats for a single Chat Context (browse-history view — no
 * freshness filtering).
 */
export async function getChats(
  userId: string,
  prisma: PrismaClient,
  context?: ChatContext
) {
  const chatsAccess = new ChatsAccess(prisma)
  return await chatsAccess.getChatsByUserId(userId, chatContextToScope(context))
}

/**
 * The chat to auto-resume on entering a Chat Context: the most recent chat for
 * that context, but only if it's still within the freshness window. Returns
 * `null` when there's no chat for the context or the most recent one is stale.
 */
export async function getResumableChat(
  userId: string,
  prisma: PrismaClient,
  context?: ChatContext
) {
  const chatsAccess = new ChatsAccess(prisma)
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
export async function getMessagesById(chatId: string, prisma: PrismaClient) {
  const chatsAccess = new ChatsAccess(prisma)
  return await chatsAccess.getMessagesByChatId(chatId)
}

/**
 * Upserts a chat by either adding messages to an existing chat or creating a new one
 */
export async function upsertChat(
  chatId: string | undefined,
  messages: z.infer<typeof messagesWithRecipesSchema>,
  prisma: PrismaClient,
  userId: string,
  context?: ChatContext,
  filterIds?: string[]
) {
  const chatsAccess = new ChatsAccess(prisma)

  if (chatId) {
    // Only append if the target chat still exists and is fresh. A chat that's
    // gone stale is never appended to again — start a new one scoped to the
    // same context instead (returning its id so the client adopts it).
    const existing = await chatsAccess.getChatById(chatId)
    if (existing && isFresh(existing.updatedAt)) {
      await chatsAccess.addMessages(chatId, messages, userId)

      await embedMessageRecipes(messages, userId, prisma)

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

  await embedMessageRecipes(messages, userId, prisma)

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
export async function generated(
  prisma: PrismaClient,
  data: Generated,
  userId: string
) {
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
  const chatsAccess = new ChatsAccess(prisma)
  const existing = await chatsAccess.getChatById(requestedChatId)
  const chatId =
    existing && !isFresh(existing.updatedAt) ? cuid() : requestedChatId
  const scope = chatContextToScope(data.context)

  await prisma.$transaction(async (tx) => {
    const recipesAccess = new RecipesAccess(tx as PrismaClient)
    const messagesAccess = new MessagesAccess(tx as PrismaClient)
    const recipesOnMessagesAccess = new RecipesOnMessagesAccess(
      tx as PrismaClient
    )

    // Ensure the chat exists (handles new chats where chatId was generated
    // client-side), persisting the context when creating.
    await tx.chat.upsert({
      where: { id: chatId },
      update: {},
      create: { id: chatId, userId, page: scope.page, recipeId: scope.recipeId }
    })

    // Upsert recipe — create if it doesn't exist yet, update if it does
    await recipesAccess.upsertRecipeWithIngredientsAndInstructions(id, {
      ...rest,
      name,
      userId,
      ingredients,
      instructions
    })

    // Create messages
    await messagesAccess.createMessages([
      { ...prompt, role: 'user', chatId },
      {
        content,
        id: messageId,
        role: 'assistant',
        chatId
      }
    ])

    // Create recipe-message relationship
    await recipesOnMessagesAccess.create(id, messageId)
  })

  await embedRecipeById(id, userId, prisma)

  return {
    success: true,
    message: 'successfully created a recipe',
    chatId
  } as const
}
