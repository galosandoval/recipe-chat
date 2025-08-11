import { type Message } from '@prisma/client'
import { DataAccess } from './data-access'

export class MessagesAccess extends DataAccess {
  /**
   * Updates an existing message with new data
   * @param messageId - The ID of the message to update
   * @param data - The data to update the message with
   */
  async updateMessage(messageId: string, data: Partial<Message>) {
    return await this.prisma.message.update({
      where: { id: messageId },
      data
    })
  }

  /**
   * Creates multiple messages in a single operation
   * @param messages - Array of message objects to create
   * @param tx - Optional transaction client for database operations
   */
  async createMessages(
    messages: Array<{
      content: string
      role: 'user' | 'assistant'
      chatId: string
      id?: string
    }>
  ) {
    return await this.prisma.message.createMany({
      data: messages.map((msg) => ({
        content: msg.content,
        role: msg.role,
        chatId: msg.chatId,
        ...(msg.id && { id: msg.id })
      }))
    })
  }
}
