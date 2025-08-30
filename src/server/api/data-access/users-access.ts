import { createId } from '@paralleldrive/cuid2'
import { hash } from 'bcryptjs'
import { DataAccess } from './data-access'
import { initialFilters } from '~/utils/stock-filters'
import type { SignUpSchemaType } from '~/schemas/sign-up-schema'
import type { CreateChatAndRecipe } from '~/schemas/chats-schema'

export class UsersAccess extends DataAccess {
  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id }
    })
  }

  async getUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username }
    })
  }

  async createUser(input: SignUpSchemaType) {
    const { email, password } = input
    const username = email.toLowerCase()
    const hashedPassword = await hash(password, 10)
    return await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        list: { create: {} },
        filter: {
          createMany: {
            data: initialFilters.map((filter) => ({
              name: filter,
              checked: false
            }))
          }
        }
      }
    })
  }

  async updateUser(userId: string, input: CreateChatAndRecipe) {
    const { recipe, messages } = input
    const { ingredients, instructions, ...rest } = recipe
    const messageId = createId()
    const chatId = createId()

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        chats: {
          create: {
            id: chatId,
            messages: {
              createMany: {
                data: messages.map((message, i, array) => {
                  if (i === array.length - 1) {
                    return {
                      content: message.content,
                      role: message.role,
                      id: messageId
                    }
                  }

                  return { content: message.content, role: message.role }
                })
              }
            }
          }
        },
        recipes: {
          create: {
            ingredients: {
              create: ingredients.map((ingredient) => ({
                name: ingredient
              }))
            },
            instructions: {
              create: instructions.map((instruction) => ({
                description: instruction
              }))
            },
            ...rest,
            messages: {
              create: {
                messageId
              }
            }
          }
        }
      },
      include: {
        recipes: true
      }
    })
  }
}
