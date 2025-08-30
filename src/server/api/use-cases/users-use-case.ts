import { TRPCError } from '@trpc/server'
import {
  type CreateChatAndRecipeSchema,
  type SignUpSchema
} from '~/server/api/schemas/users-schema'
import { UsersAccess } from '~/server/api/data-access/users-access'
import type { Context } from '~/server/api/trpc'
import { createId } from '@paralleldrive/cuid2'
import type { PrismaClient } from '@prisma/client'

export async function signUp(input: SignUpSchema, prisma: PrismaClient) {
  const usersDataAccess = new UsersAccess(prisma)
  const username = input.email.toLowerCase()

  const duplicateUser = await usersDataAccess.getUserByUsername(username)

  if (duplicateUser) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'User already exists.'
    })
  }
  return usersDataAccess.createUser(input)
}

export async function createChatAndRecipe(
  ctx: Context,
  input: CreateChatAndRecipeSchema
) {
  const { recipe, messages } = input
  const userId = ctx?.session?.user.id

  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized'
    })
  }
  const messageId = createId()
  const chatId = createId()

  const { ingredients, instructions, ...rest } = recipe

  const onboardedUser = await ctx.prisma.user.update({
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
          messages: { create: { messageId } }
        }
      }
    },
    include: {
      recipes: true
    }
  })

  return onboardedUser
}
