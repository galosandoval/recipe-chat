import { type PrismaClient } from '@prisma/client'
import { ChatsDataAccess } from '~/server/api/data-access/chats'
import { type z } from 'zod'
import { type messagesWithRecipesSchema } from '~/schemas/chats'

export async function getChats(userId: string, prisma: PrismaClient) {
  const chatsDataAccess = new ChatsDataAccess(prisma)
  return await chatsDataAccess.getChatsByUserId(userId)
}

export async function getMessagesById(chatId: string, prisma: PrismaClient) {
  const chatsDataAccess = new ChatsDataAccess(prisma)
  return await chatsDataAccess.getMessagesByChatId(chatId)
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
  const chatsDataAccess = new ChatsDataAccess(prisma)

  if (chatId) {
    // Add messages to existing chat
    await chatsDataAccess.addMessages(chatId, messages, userId)

    return {
      success: true,
      message: 'successfully added messages'
    } as const
  } else {
    // Create new chat with all messages
    const newChat = await chatsDataAccess.createChatWithMessages(
      userId,
      messages
    )

    return {
      success: true,
      message: 'successfully created a chat',
      chatId: newChat.id
    } as const
  }
}
