import { type PrismaClient } from '@prisma/client'
import { ChatsDataAccess } from '~/server/api/data-access/chats'
import { type z } from 'zod'
import type { messagesSchema } from '~/schemas/messages'

export async function getChats(userId: string, prisma: PrismaClient) {
  const chatsDataAccess = new ChatsDataAccess(prisma)
  return await chatsDataAccess.getChatsByUserId(userId)
}

export async function getMessagesById(chatId: string, prisma: PrismaClient) {
  const chatsDataAccess = new ChatsDataAccess(prisma)
  return await chatsDataAccess.getMessagesByChatId(chatId)
}

export async function createChat(
  userId: string,
  messages: z.infer<typeof messagesSchema>,
  prisma: PrismaClient
) {
  const chatsDataAccess = new ChatsDataAccess(prisma)
  return await chatsDataAccess.createChat(userId, messages)
}

export async function addMessages(
  chatId: string,
  messages: z.infer<typeof messagesSchema>,
  prisma: PrismaClient
) {
  const chatsDataAccess = new ChatsDataAccess(prisma)
  return await chatsDataAccess.addMessages(chatId, messages)
}

export async function createChatOrAddMessages(
	chatId: string | undefined,
	messages: z.infer<typeof messagesSchema>,
	prisma: PrismaClient,
	userId: string
) {
	const chatsDataAccess = new ChatsDataAccess(prisma)
	if (chatId) {
		const lastTwoMessages = messages.slice(-2)

		await chatsDataAccess.addMessages(chatId, lastTwoMessages)

		const allMessages = await prisma.message.findMany({
			where: {
				chatId
			},
			orderBy: {
				id: 'asc'
			}
		})

		return {
			success: true,
			message: 'successfully added messages',
			messages: allMessages
		} as const
	} else {
		const newChat = await chatsDataAccess.createChat(userId, messages)

		return {
			success: true,
			message: 'successfully created a chat',
			chatId: newChat.id,
			messages: newChat.messages
		} as const
	}
}
