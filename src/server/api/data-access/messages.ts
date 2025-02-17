import { PrismaClient } from '@prisma/client'
import { prisma } from '~/server/db'

class MessagesDataAccess {
  constructor(readonly prisma: PrismaClient) {}

  async updateMessageRecipeId(messageId: string, recipeId: string) {
    return await this.prisma.message.update({
      where: { id: messageId },
      data: {
        recipeId
      }
    })
  }
}

export const messagesDataAccess = new MessagesDataAccess(prisma)
