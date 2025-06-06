import { createId } from '@paralleldrive/cuid2'
import { type PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import {
  type CreateChatAndRecipeSchema,
  type SignUpSchema
} from '~/server/api/schemas/users'

export class UsersDataAccess {
  constructor(private readonly prisma: PrismaClient) {}

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

  async createUser(input: SignUpSchema) {
    const { email, password } = input
    const username = email.toLowerCase()
    const hashedPassword = await hash(password, 10)
    return await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        list: { create: {} }
      }
    })
  }

  async updateUser(userId: string, input: CreateChatAndRecipeSchema) {
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
            message: { connect: { id: messageId } }
          }
        }
      },
      include: {
        recipes: true
      }
    })
  }
}

