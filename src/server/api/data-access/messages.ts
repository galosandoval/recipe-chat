import { type PrismaClient, type Message } from '@prisma/client'

type CreateMessageInput = Pick<
	Message,
	'chatId' | 'content' | 'role' | 'sortOrder'
> & {
	createdAt?: Date
	updatedAt?: Date
}

export class MessagesDataAccess {
	constructor(private readonly prisma: PrismaClient) {}

	async getMessagesByChatId(chatId: string) {
		return await this.prisma.message.findMany({
			where: { chatId },
			orderBy: { id: 'asc' },
			include: {
				recipes: true
			}
		})
	}

	async updateMessage(messageId: string, data: Partial<Message>) {
		return await this.prisma.message.update({
			where: { id: messageId },
			data
		})
	}

	async createMessages(messages: CreateMessageInput[]) {
		return await this.prisma.message.createManyAndReturn({
			data: messages
		})
	}
}
