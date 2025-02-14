import { createId } from '@paralleldrive/cuid2'
import { hash } from 'bcryptjs'
import {
  CreateChatAndRecipeSchema,
  SignUpSchema
} from '~/server/api/schemas/users'
import { prisma } from '~/server/db'

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  })
}

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username }
  })
}

export async function createUser(input: SignUpSchema) {
  const { email, password } = input
  const username = email.toLowerCase()
  const hashedPassword = await hash(password, 10)
  return await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      list: { create: {} }
    }
  })
}

export async function updateUser(
  userId: string,
  input: CreateChatAndRecipeSchema
) {
  const { recipe, messages } = input
  const { ingredients, instructions, ...rest } = recipe
  const messageId = createId()
  const chatId = createId()

  return await prisma.user.update({
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
