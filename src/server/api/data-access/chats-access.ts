import { type PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import type { MessagesWithRecipes } from '~/schemas/chats-schema'
import { DataAccess } from './data-access'
import type { CreateChatWithMessages } from '~/schemas/chats-schema'
import { slugify } from '~/lib/utils'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'

export class ChatsAccess extends DataAccess {
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
  async createChatWithMessages({ userId, messages }: CreateChatWithMessages) {
    return this.transaction(async (tx) => {
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
    messages: MessagesWithRecipes,
    userId: string
  ) {
    await this.transaction(async (tx) => {
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
    tx: Omit<PrismaClient, ITXClientDenyList>,
    messageId: string,
    userId: string,
    recipes: MessagesWithRecipes[number]['recipes']
  ) {
    for (const recipe of recipes) {
      const existingRecipe = await tx.recipe.findUnique({
        where: {
          id: recipe.id
        }
      })
      if (existingRecipe) {
        await tx.recipe.update({
          where: {
            id: recipe.id
          },
          data: {
            ...recipe,
            ingredients: {
              create: recipe.ingredients?.map((i: string) =>
                ingredientStringToCreatePayload(i)
              )
            },
            instructions: {
              create: recipe.instructions?.map((i: string) => ({
                description: i
              }))
            }
          }
        })
        await tx.recipesOnMessages.create({
          data: {
            recipeId: recipe.id,
            messageId
          }
        })
      } else {
        const createdRecipe = await tx.recipe.create({
          data: {
            id: recipe.id,
            name: recipe.name,
            slug: slugify(recipe.name),
            description: recipe.description,
            prepMinutes: recipe.prepMinutes,
            cookMinutes: recipe.cookMinutes,
            user: {
              connect: {
                id: userId
              }
            },
            ingredients: {
              create: recipe.ingredients?.map((i: string) =>
                ingredientStringToCreatePayload(i)
              )
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
}
