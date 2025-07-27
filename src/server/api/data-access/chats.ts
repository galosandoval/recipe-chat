import { type PrismaClient } from '@prisma/client'
import { type z } from 'zod'
import type { messagesSchema } from '~/server/api/schemas/messages'

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

  async getMessagesByChatId(chatId: string) {
    return this.prisma.chat.findFirst({
      where: {
        id: chatId
      },

      include: {
        messages: {
          orderBy: {
            id: 'asc'
          },
          include: {
            recipes: true
          }
        }
      }
    })
  }

  async createChat(userId: string, messages: z.infer<typeof messagesSchema>) {
    return this.prisma.chat.create({
      data: {
        userId,

        messages: {
          createMany: {
            data: messages.map((message) => ({
              content: message.content,
              role: message.role
            }))
          }
        }
      },

      include: {
        messages: true
      }
    })
  }

  async addMessages(chatId: string, messages: z.infer<typeof messagesSchema>) {
    return await this.prisma.$transaction(
      messages.map((m) =>
        this.prisma.message.create({
          data: { content: m.content, role: m.role, chatId }
        })
      )
    )
  }
}
