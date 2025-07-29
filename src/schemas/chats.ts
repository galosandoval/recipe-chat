import { z } from 'zod'
import type { Message, Recipe } from '@prisma/client'
import type { RouterOutputs } from '~/trpc/react'

export const generatedRecipeSchema = z.object({
  name: z.string().describe('Name of recipe.'),
  description: z.string().describe('Description of recipe. 1 to 2 sentences.'),
  prepTime: z
    .string()
    .optional()
    .nullable()
    .describe('Preparation time of recipe. Optional.'),
  cookTime: z
    .string()
    .optional()
    .nullable()
    .describe('Cook time of recipe. Optional.'),
  categories: z
    .array(z.string())
    .optional()
    .describe('Array of recipe categories. Optional.'),
  ingredients: z
    .array(z.string())
    .optional()
    .describe('Array of ingredients. Optional.'),
  instructions: z
    .array(z.string())
    .optional()
    .describe('Array of instructions. Optional.')
})
export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>

export const generatedMessageSchema = z.object({
  content: z.string().describe('Helpful message.'),
  recipes: z.array(generatedRecipeSchema).describe('Array of recipes.')
})
export type GeneratedMessage = z.infer<typeof generatedMessageSchema>

export const messageRole = ['assistant', 'data', 'user', 'system'] as const

export const chatParams = z.object({
  messages: z.array(
    z.object({
      role: z.enum(messageRole),
      content: z.string()
    })
  ),
  filters: z.array(z.string())
})

// export type ChatParams = z.infer<typeof chatParams>

export const messagesSchema = z.array(
  z.object({
    content: z.string().min(1),
    role: z.enum(messageRole),
    id: z.string().optional(),
    recipes: z.array(generatedRecipeSchema).optional()
  })
)

export type MessagesSchema = z.infer<typeof messagesSchema>

export const createOrAddMessages = z.object({
  chatId: z.string().optional(),
  messages: messagesSchema
})

export type CreateOrAddMessages = z.infer<typeof createOrAddMessages>
// export type GetChatOutput = RouterOutputs['chats']['getChat']
// export type GetChatMessageOutput = NonNullable<GetChatOutput>[number]

export type MessageWithRecipes = Message & { recipes?: GeneratedRecipe[] }

export type MessagesDTO = NonNullable<
  RouterOutputs['chats']['getMessagesById']
>['messages']