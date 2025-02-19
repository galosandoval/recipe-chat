import { type PrismaClient, type Message } from '@prisma/client'

export class MessagesDataAccess {
  constructor(private readonly prisma: PrismaClient) {}

  async updateMessage(messageId: string, data: Partial<Message>) {
    return await this.prisma.message.update({
      where: { id: messageId },
      data
    })
  }
}
