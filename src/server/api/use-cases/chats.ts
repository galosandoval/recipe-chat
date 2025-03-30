import { type PrismaClient } from '@prisma/client'
import { ChatsDataAccess } from '~/server/api/data-access/chats'
import { MessagesDataAccess } from '~/server/api/data-access/messages'
import type { MessagesSchema } from '~/schemas/chats'
import type { CreateOrAddMessages } from '~/schemas/chats'
// import type { RouterInputs } from '~/trpc/react'

export async function getChats(userId: string, prisma: PrismaClient) {
	const chatsDataAccess = new ChatsDataAccess(prisma)
	return await chatsDataAccess.getChatsByUserId(userId)
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
	prisma: PrismaClient,
	userId: string
) {
	const chatsDataAccess = new ChatsDataAccess(prisma)
	return await chatsDataAccess.addMessages(chatId, messages, userId)
}

export async function createChatOrAddMessages(
	input: CreateOrAddMessages,
	prisma: PrismaClient,
	userId: string
) {
	const { chatId, messages } = input
	let chatIdToReturn = chatId
	const chatsDataAccess = new ChatsDataAccess(prisma)
	if (chatId) {
		const lastTwoMessages = messages.slice(-1)

		const newMessages = await chatsDataAccess.addMessages(
			chatId,
			lastTwoMessages,
			userId
		)

		if (newMessages.length) {
			const messagesDataAccess = new MessagesDataAccess(prisma)
			const messages =
				await messagesDataAccess.getMessagesByChatId(chatId)
			return {
				messages
			}
		}
		console.warn('Did not add new messages. newMessages:', newMessages)
	} else {
		const newChat = await chatsDataAccess.createChat(userId, messages)
		chatIdToReturn = newChat.id
	}

	if (!chatIdToReturn) {
		throw new Error('Chat ID is null')
	}

	const chat = await chatsDataAccess.getChatById(chatIdToReturn)
	if (!chat) {
		throw new Error('Chat is null')
	}
	return {
		chatId: chat.id,
		messages: chat.messages
	}
}

export async function getChat(id: string, prisma: PrismaClient) {
	const chatsDataAccess = new ChatsDataAccess(prisma)
	return await chatsDataAccess.getChatById(id)
}
