import { type PrismaClient } from '@prisma/client'
import { type z } from 'zod'
import type { messagesWithRecipesSchema } from '~/schemas/chats'

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
            createdAt: 'asc'
          },
          include: {
            recipes: {
              include: {
                recipe: {
                  include: {
                    ingredients: true,
                    instructions: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  /**
   * Creates a new chat with messages and their associated recipes
   */
  async createChatWithMessages(
    userId: string,
    messages: z.infer<typeof messagesWithRecipesSchema>
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Create the chat
      const newChat = await tx.chat.create({
        data: {
          userId
        }
      })

      // Create messages and their recipes
      for (const message of messages) {
        const newMessage = await tx.message.create({
          data: {
            content: message.content,
            role: message.role,
            chatId: newChat.id,
            id: message.id
          }
        })

        // Create recipes for this message if they exist
        if (message.recipes?.length) {
          await this.createRecipesForMessage(
            tx,
            newMessage.id,
            userId,
            message.recipes
          )
        }
      }

      return newChat
    })
  }

  /**
   * Adds messages to an existing chat
   */
  async addMessages(
    chatId: string,
    messages: z.infer<typeof messagesWithRecipesSchema>,
    userId: string
  ) {
    await this.prisma.$transaction(async (tx) => {
      for (const message of messages) {
        const newMessage = await tx.message.create({
          data: {
            content: message.content,
            role: message.role,
            chatId,
            id: message.id
          }
        })

        // Create recipes for this message if they exist
        if (message.recipes?.length) {
          await this.createRecipesForMessage(
            tx,
            newMessage.id,
            userId,
            message.recipes
          )
        }
      }
    })
  }

  /**
   * Creates recipes for a specific message
   */
  private async createRecipesForMessage(
    tx: any,
    messageId: string,
    userId: string,
    recipes: any[]
  ) {
    for (const recipe of recipes) {
      const createdRecipe = await tx.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          categories: recipe.categories,
          user: {
            connect: {
              id: userId
            }
          },
          ingredients: {
            create: recipe.ingredients?.map((i: string) => ({
              name: i
            }))
          },
          instructions: {
            create: recipe.instructions?.map((i: string) => ({
              description: i
            }))
          }
        }
      })

      // Create the many-to-many relationship between recipe and message
      await tx.recipesOnMessages.create({
        data: {
          recipeId: createdRecipe.id,
          messageId
        }
      })
    }
  }
}
