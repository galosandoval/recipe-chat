import { type PrismaClient } from '@prisma/client'
import { ChatsDataAccess } from '~/server/api/data-access/chats'
import type { MessagesSchema } from '~/schemas/messages'

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
	messages: MessagesSchema,
	prisma: PrismaClient
) {
	const chatsDataAccess = new ChatsDataAccess(prisma)
	return await chatsDataAccess.createChat(userId, messages)
}

export async function addMessages(
	chatId: string,
	messages: MessagesSchema,
	prisma: PrismaClient
) {
	const chatsDataAccess = new ChatsDataAccess(prisma)
	return await chatsDataAccess.addMessages(chatId, messages)
}

export async function createChatOrAddMessages(
	chatId: string | undefined,
	messages: MessagesSchema,
	prisma: PrismaClient,
	userId: string
) {
	console.log('messages--->', messages)
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
			},
			include: {
				recipes: true
			}
		})

		return {
			messages: allMessages
		}
	} else {
		const newChat = await chatsDataAccess.createChat(userId, messages)

		return {
			chatId: newChat.id,
			messages: newChat.messages
		}
	}
}

export async function getChat(id: string, prisma: PrismaClient) {
	const chatsDataAccess = new ChatsDataAccess(prisma)
	return await chatsDataAccess.getChatById(id)
}
