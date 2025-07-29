import { z } from 'zod'
import type { Message } from '@prisma/client'
import type { RouterOutputs } from '~/trpc/react'
import {
  messageSchema,
  generatedRecipeSchema,
  messagesSchema,
  type GeneratedRecipe
} from '~/schemas/messages'

export const chatParams = z.object({
  messages: z.array(messageSchema.omit({ createdAt: true, updatedAt: true })),
  filters: z.array(z.string())
})

export const createOrAddMessages = z.object({
  chatId: z.string().optional(),
  messages: messagesSchema
})

export type CreateOrAddMessages = z.infer<typeof createOrAddMessages>

export const generatedMessageSchema = z.object({
  content: z.string().describe('Helpful message.'),
  recipes: z.array(generatedRecipeSchema).describe('Array of recipes.')
})
export type GeneratedMessage = z.infer<typeof generatedMessageSchema>

export type MessageWithRecipes = Message & { recipes?: GeneratedRecipe[] }

export type MessagesDTO = NonNullable<
  RouterOutputs['chats']['getMessagesById']
>['messages']
