import { z } from 'zod'
import type { Message, Recipe } from '@prisma/client'
import type { RouterOutputs } from '~/trpc/react'
import {
  messageSchema,
  generatedRecipeSchema,
  messagesSchema,
  type GeneratedRecipe,
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

export type RecipeDTO = Pick<
  Recipe,
  'id' | 'name' | 'description' | 'prepTime' | 'cookTime' | 'saved'
> & {
  ingredients: string[]
  instructions: string[]
}

export type MessageWithRecipes = Message & {
  recipes: RecipeDTO[]
}

export type MessageWithRecipesDTO = NonNullable<
  RouterOutputs['chats']['getMessagesById']
>['messages'][number]

export const messagesWithRecipesSchema = z.array(
  messageSchema.merge(
    z.object({
      recipes: generatedRecipeWithIdSchema.array()
    })
  )
)
export type MessagesWithRecipes = z.infer<typeof messagesWithRecipesSchema>

export const upsertChatSchema = z.object({
  chatId: z.string().optional(),
  messages: messagesWithRecipesSchema
})
export type UpsertChatSchema = z.infer<typeof upsertChatSchema>

// Api to use when user clicks on a recipe to generate
export const generatedSchema = z.object({
  id: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prepTime: z.string(),
  cookTime: z.string(),
  messageId: z.string(),
  content: z.string(),
  chatId: z.string()
  // categories: z.array(z.string())
})
export type Generated = z.infer<typeof generatedSchema>