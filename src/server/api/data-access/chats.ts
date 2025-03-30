import { type PrismaClient, type Message } from '@prisma/client'
import { type z } from 'zod'
import { MessagesDataAccess } from './messages'
import { type messagesSchema } from '~/schemas/chats'

export class ChatsDataAccess {
	constructor(private readonly prisma: PrismaClient) {}

	async getChatsByUserId(userId: string) {
		return this.prisma.chat.findMany({
			where: {
				userId: userId
			},
			orderBy: {
				updatedAt: 'desc'
			},
			include: {
				messages: {
					orderBy: {
						id: 'desc'
					},
					take: 1
				}
			},
			take: 5
		})
	}

	async createChat(userId: string, messages: z.infer<typeof messagesSchema>) {
		const createdChat = await this.prisma.chat.create({
			data: {
				userId
			}
		})

		if (!createdChat) {
			throw new Error('Failed to create chat')
		}

		const messagesDataAccess = new MessagesDataAccess(this.prisma)

		const createdMessages = await messagesDataAccess.createMessages(
			messages.map((m, index) => ({
				...m,
				chatId: createdChat.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				sortOrder: index,
				recipes: m.recipes?.map((r) => ({
					...r,
					createdAt: new Date(),
					updatedAt: new Date()
				}))
			}))
		)
		return { ...createdChat, messages: createdMessages }
	}

	async addMessages(
		chatId: string,
		messages: z.infer<typeof messagesSchema>,
		userId: string
	) {
		const newMessages: Message[] = []
		await this.prisma.$transaction(async (tx) => {
			for (const message of messages) {
				const chat = await tx.chat.findUnique({
					where: { id: chatId },
					include: {
						messages: true
					}
				})
				const sortOrder = chat?.messages.length ?? 0
				console.log('message', message)
				const newMessage = await tx.message.create({
					data: {
						content: message.content,
						role: message.role,
						chatId,
						id: message.id,
						sortOrder
					}
				})
				for (const recipe of message.recipes ?? []) {
					await tx.recipe.create({
						data: {
							...recipe,
							userId,
							instructions: {
								create:
									recipe.instructions?.map((i) => ({
										description: i
									})) ?? []
							},
							ingredients: {
								create:
									recipe.ingredients?.map((i) => ({
										name: i
									})) ?? []
							},
							messageId: newMessage.id
						}
					})
				}
				newMessages.push(newMessage)
			}
		})

		if (newMessages.length === 0) {
			throw new Error('Failed to add messages')
		}

		return newMessages
	}

	async getChatById(id: string) {
		return this.prisma.chat.findUnique({
			where: { id },
			include: {
				messages: {
					include: {
						recipes: {
							include: {
								instructions: true,
								ingredients: true
							}
						}
					},
					orderBy: {
						sortOrder: 'asc'
					}
				}
			}
		})
	}
}
