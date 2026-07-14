import { type PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import type { MessagesWithRecipes } from '~/schemas/chats-schema'
import { DataAccess } from './data-access'
import type { ChatScope, CreateChatWithMessages } from '~/schemas/chats-schema'
import { slugify } from '~/lib/utils'
import { toRecipeWriteData } from '~/schemas/recipes-schema'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'

export class ChatsAccess extends DataAccess {
  /**
   * Browse-history view for the chats-drawer: every chat for a user within a
   * single Chat Context, most-recent-first. No freshness filtering — stale chats
   * are still legitimate to open manually.
   */
  async getChatsByUserId(userId: string, scope: ChatScope) {
    return this.prisma.chat.findMany({
      where: {
        userId,
        page: scope.page,
        recipeId: scope.recipeId
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
      }
    })
  }

  /**
   * The most recent chat for a Chat Context, used to decide auto-resume. Returns
   * the chat regardless of freshness — the 2-hour rule is applied by the caller.
   */
  async getMostRecentChat(userId: string, scope: ChatScope) {
    return this.prisma.chat.findFirst({
      where: {
        userId,
        page: scope.page,
        recipeId: scope.recipeId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  }

  async getChatById(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, updatedAt: true }
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
  async createChatWithMessages({
    userId,
    messages,
    filterIds,
    page,
    recipeId
  }: CreateChatWithMessages) {
    return this.transaction(async (tx) => {
      // Create the chat
      const newChat = await tx.chat.create({
        data: {
          userId,
          filterIds: filterIds ?? [],
          page: page ?? 'recipes',
          recipeId: recipeId ?? null
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

      // Touch the chat so `updatedAt` reflects the new activity — the freshness
      // rule (auto-resume + stale-swap) reads `updatedAt`, and appending
      // messages alone doesn't bump it.
      await tx.chat.update({ where: { id: chatId }, data: {} })
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
        const { id, ingredients, instructions, ...recipeData } = recipe
        await tx.recipe.update({
          where: {
            id
          },
          data: {
            ...toRecipeWriteData(recipeData),
            ingredients: {
              deleteMany: {},
              create: ingredients?.map((i: string) =>
                ingredientStringToCreatePayload(i)
              )
            },
            instructions: {
              deleteMany: {},
              create: instructions?.map((i: string) => ({
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
            ...toRecipeWriteData(recipe),
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
