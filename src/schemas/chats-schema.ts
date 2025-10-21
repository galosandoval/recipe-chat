import { z } from 'zod'
import type { Message, Recipe } from '@prisma/client'
import type { RouterOutputs } from '~/trpc/react'
import {
  messageSchema,
  generatedRecipeSchema,
  messagesSchema,
  type GeneratedRecipe,
  generatedRecipeWithIdSchema,
  roleSchema
} from '~/schemas/messages-schema'
import { idSchema, userIdSchema } from '~/schemas/ids-schema'

export const createChatAndRecipeSchema = z.object({
  recipe: z.object({
    description: z.string().optional(),
    name: z.string(),
    imgUrl: z.string().optional(),
    author: z.string().optional(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    prepMinutes: z.number().optional(),
    cookMinutes: z.number().optional()
  }),
  messages: z
    .object({
      content: z.string().min(1),
      role: roleSchema
    })
    .array()
})
export type CreateChatAndRecipe = z.infer<typeof createChatAndRecipeSchema>

export const chatParams = z.object({
  messages: z.array(messageSchema.omit({ createdAt: true, updatedAt: true })),
  filters: z.array(z.string()),
  userId: userIdSchema.shape.userId.optional()
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
  | 'id'
  | 'name'
  | 'description'
  | 'cuisine'
  | 'course'
  | 'dietTags'
  | 'flavorTags'
  | 'mainIngredients'
  | 'techniques'
  | 'prepMinutes'
  | 'cookMinutes'
  | 'saved'
  | 'slug'
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
  messages: messagesWithRecipesSchema,
  filterIds: z.array(idSchema.shape.id).optional()
})
export type UpsertChatSchema = z.infer<typeof upsertChatSchema>

// Api to use when user clicks on a recipe to generate
export const generatedSchema = z.object({
  prompt: messageSchema,
  generated: z.object({
    content: z.string(),
    id: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    prepMinutes: z.number().optional().nullable(),
    cookMinutes: z.number().optional().nullable(),
    cuisine: z.string().optional(),
    course: z.string().optional(),
    dietTags: z.array(z.string()).optional(),
    flavorTags: z.array(z.string()).optional(),
    mainIngredients: z.array(z.string()).optional(),
    techniques: z.array(z.string()).optional(),
    messageId: z.string(),
    chatId: z.string()
  })
})
export type Generated = z.infer<typeof generatedSchema>

export const createChatWithMessagesSchema = z
  .object({
    messages: messagesWithRecipesSchema
  })
  .merge(userIdSchema)
export type CreateChatWithMessages = z.infer<
  typeof createChatWithMessagesSchema
>
