import { TRPCError } from '@trpc/server'
import { usersAccess } from '~/server/api/data-access/users-access'
import type { SignUpSchema } from '~/schemas/sign-up-schema'
import type { CreateChatAndRecipe } from '~/schemas/chats-schema'

export async function signUp(input: SignUpSchema) {
  const username = input.email.toLowerCase()

  const duplicateUser = await usersAccess.getUserByUsername(username)

  if (duplicateUser) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'User already exists.'
    })
  }
  return usersAccess.createUser(input)
}

export async function createChatAndRecipe(
  userId: string,
  input: CreateChatAndRecipe
) {
  return usersAccess.createChatAndRecipe(userId, input)
}
