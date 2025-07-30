import { z } from 'zod'
import type { Message } from '@prisma/client'
import type { RouterOutputs } from '~/trpc/react'
import {
  messageSchema,
  generatedRecipeSchema,
  messagesSchema,
  type GeneratedRecipe,
  type GeneratedRecipeWithId,
  generatedRecipeWithIdSchema
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

export type MessageWithGenRecipes = Message & { recipes?: GeneratedRecipe[] }

export type MessageWithRecipes = Message & {
  recipes?: GeneratedRecipeWithId[]
}

export type MessagesDTO = NonNullable<
  RouterOutputs['chats']['getMessagesById']
>['messages']

export const messagesWithRecipesSchema = z.array(
  messageSchema.merge(
    z.object({
      recipes: generatedRecipeWithIdSchema.array()
    })
  )
)

export const upsertChatSchema = z.object({
  chatId: z.string().optional(),
  messages: messagesWithRecipesSchema
})
export type UpsertChatSchema = z.infer<typeof upsertChatSchema>
type Something = UpsertChatSchema['messages'][number]['recipes'][number]