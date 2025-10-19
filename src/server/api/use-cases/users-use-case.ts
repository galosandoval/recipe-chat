import { TRPCError } from '@trpc/server'
import { UsersAccess } from '~/server/api/data-access/users-access'
import type { Context } from '~/server/api/trpc'
import { cuid } from '~/lib/createId'
import type { PrismaClient } from '@prisma/client'
import type { SignUpSchema } from '~/schemas/sign-up-schema'
import type { CreateChatAndRecipe } from '~/schemas/chats-schema'

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
  input: CreateChatAndRecipe
) {
  const { recipe, messages } = input
  const userId = ctx?.session?.user.id

  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized'
    })
  }
  const messageId = cuid()
  const chatId = cuid()

  const { ingredients, instructions, ...rest } = recipe
  const recipeId = cuid()

  await ctx.prisma.user.update({
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
          id: recipeId,
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

  return { recipeId }
}
