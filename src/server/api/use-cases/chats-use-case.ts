import { type PrismaClient } from '@prisma/client'
import { ChatsAccess } from '~/server/api/data-access/chats-access'
import { type z } from 'zod'
import { type Generated, type messagesWithRecipesSchema } from '~/schemas/chats'
import { RecipesAccess } from '../data-access/recipes-access'
import { RecipesOnMessagesAccess } from '../data-access/recipes-on-messages-access'
import { MessagesAccess } from '../data-access/messages-access'

/**
 * Retrieves all chats for a specific user
 */
export async function getChats(userId: string, prisma: PrismaClient) {
  const chatsAccess = new ChatsAccess(prisma)
  return await chatsAccess.getChatsByUserId(userId)
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
  userId: string
) {
  const chatsAccess = new ChatsAccess(prisma)

  if (chatId) {
    // Add messages to existing chat
    await chatsAccess.addMessages(chatId, messages, userId)

    return {
      success: true,
      message: 'successfully added messages'
    } as const
  } else {
    // Create new chat with all messages
    const newChat = await chatsAccess.createChatWithMessages(userId, messages)

    return {
      success: true,
      message: 'successfully created a chat',
      chatId: newChat.id
    } as const
  }
}

/**
 * Processes a generated recipe by updating the recipe with ingredients and instructions,
 * creating associated messages, and establishing the recipe-message relationship
 */
export async function generated(prisma: PrismaClient, data: Generated) {
  const { prompt, generated } = data
  const { id, ingredients, content, instructions, messageId, chatId, ...rest } =
    generated

  await prisma.$transaction(async (tx) => {
    const recipesAccess = new RecipesAccess(tx as PrismaClient)
    const messagesAccess = new MessagesAccess(tx as PrismaClient)
    const recipesOnMessagesAccess = new RecipesOnMessagesAccess(
      tx as PrismaClient
    )

    // Update recipe with ingredients and instructions
    await recipesAccess.updateRecipeWithIngredientsAndInstructions(id, {
      ...rest,
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

  return {
    success: true,
    message: 'successfully created a recipe'
  } as const
}
