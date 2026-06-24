import { type PrismaClient } from '@prisma/client'
import { ChatsAccess } from '~/server/api/data-access/chats-access'
import { type z } from 'zod'
import {
  type Generated,
  type MessagesWithRecipes,
  type messagesWithRecipesSchema
} from '~/schemas/chats-schema'
import { RecipesAccess } from '../data-access/recipes-access'
import { RecipeVectorAccess } from '../data-access/recipe-vector-access'
import { RecipesOnMessagesAccess } from '../data-access/recipes-on-messages-access'
import { MessagesAccess } from '../data-access/messages-access'

async function embedMessageRecipes(
  messages: MessagesWithRecipes,
  userId: string,
  prisma: PrismaClient
) {
  const vectorAccess = new RecipeVectorAccess(prisma)
  const recipes = messages.flatMap((m) => m.recipes ?? [])
  await Promise.all(
    recipes.map(async (recipe) => {
      const signature = vectorAccess.buildSignatureFromRecipe({
        name: recipe.name,
        description: recipe.description ?? null,
        cuisine: recipe.cuisine ?? null,
        course: recipe.course ?? null,
        dietTags: recipe.dietTags ?? [],
        flavorTags: recipe.flavorTags ?? [],
        mainIngredients: recipe.mainIngredients ?? [],
        techniques: recipe.techniques ?? []
      })
      try {
        await vectorAccess.upsertEmbedding(recipe.id, userId, signature)
      } catch (err) {
        console.error('[recipe-vector] upsertEmbedding failed', {
          recipeId: recipe.id,
          err
        })
      }
    })
  )
}

/**
 * Retrieves all chats for a specific user
 */
export async function getChats(userId: string, prisma: PrismaClient) {
  const chatsAccess = new ChatsAccess(prisma)
  return await chatsAccess.getChatsByUserId(userId)
}

/**
 * Retrieves all messages for a specific chat
 */
export async function getMessagesById(chatId: string, prisma: PrismaClient) {
  const chatsAccess = new ChatsAccess(prisma)
  return await chatsAccess.getMessagesByChatId(chatId)
}

/**
 * Upserts a chat by either adding messages to an existing chat or creating a new one
 */
export async function upsertChat(
  chatId: string | undefined,
  messages: z.infer<typeof messagesWithRecipesSchema>,
  prisma: PrismaClient,
  userId: string,
  filterIds?: string[]
) {
  const chatsAccess = new ChatsAccess(prisma)

  if (chatId) {
    // Add messages to existing chat
    await chatsAccess.addMessages(chatId, messages, userId)

    await embedMessageRecipes(messages, userId, prisma)

    return {
      success: true,
      message: 'successfully added messages'
    } as const
  } else {
    // Create new chat with all messages
    const newChat = await chatsAccess.createChatWithMessages({
      userId,
      messages,
      filterIds
    })

    await embedMessageRecipes(messages, userId, prisma)

    return {
      success: true,
      message: 'successfully created a chat',
      chatId: newChat.id
    } as const
  }
}

/**
 * Processes a generated recipe by updating the recipe with ingredients and instructions,
 * creating associated messages, and establishing the recipe-message relationship
 */
export async function generated(
  prisma: PrismaClient,
  data: Generated,
  userId: string
) {
  const { prompt, generated } = data
  const {
    id,
    name,
    ingredients,
    content,
    instructions,
    messageId,
    chatId,
    ...rest
  } = generated

  await prisma.$transaction(async (tx) => {
    const recipesAccess = new RecipesAccess(tx as PrismaClient)
    const messagesAccess = new MessagesAccess(tx as PrismaClient)
    const recipesOnMessagesAccess = new RecipesOnMessagesAccess(
      tx as PrismaClient
    )

    // Ensure the chat exists (handles new chats where chatId was generated client-side)
    await tx.chat.upsert({
      where: { id: chatId },
      update: {},
      create: { id: chatId, userId }
    })

    // Upsert recipe — create if it doesn't exist yet, update if it does
    await recipesAccess.upsertRecipeWithIngredientsAndInstructions(id, {
      ...rest,
      name,
      userId,
      ingredients,
      instructions
    })

    // Create messages
    await messagesAccess.createMessages([
      { ...prompt, role: 'user', chatId },
      {
        content,
        id: messageId,
        role: 'assistant',
        chatId
      }
    ])

    // Create recipe-message relationship
    await recipesOnMessagesAccess.create(id, messageId)
  })

  const vectorAccess = new RecipeVectorAccess(prisma)
  const signature = vectorAccess.buildSignatureFromRecipe({
    name,
    description: null,
    cuisine: rest.cuisine ?? null,
    course: rest.course ?? null,
    dietTags: rest.dietTags ?? [],
    flavorTags: rest.flavorTags ?? [],
    mainIngredients: rest.mainIngredients ?? [],
    techniques: rest.techniques ?? []
  })
  try {
    await vectorAccess.upsertEmbedding(id, userId, signature)
  } catch (err) {
    console.error('[recipe-vector] upsertEmbedding failed', {
      recipeId: id,
      err
    })
  }

  return {
    success: true,
    message: 'successfully created a recipe'
  } as const
}
