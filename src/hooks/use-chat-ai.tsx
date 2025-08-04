import { useSession } from 'next-auth/react'
import { useFiltersByUser } from '~/components/recipe-filters'
import { api } from '~/trpc/react'
import { chatStore } from '~/stores/chat-store'
import { createId } from '@paralleldrive/cuid2'
import { useCallback, useEffect } from 'react'
import type {
  Generated,
  generatedMessageSchema,
  MessageWithRecipes,
  MessageWithRecipesDTO,
  UpsertChatSchema
} from '~/schemas/chats'
import { type Experimental_UseObjectHelpers as UseObjectHelpers } from '@ai-sdk/react'
import { toast } from '~/components/toast'

type Object = UseObjectHelpers<typeof generatedMessageSchema, string>['object']
type Error = UseObjectHelpers<typeof generatedMessageSchema, string>['error']
type OnFinish = { object: Object; error: Error }

/**
 * Transforms database message data to the format expected by chatStore
 */
const transformMessagesToChatStore = (
  /**
   * Transforms an array of MessageWithRecipesDTO objects into MessageWithRecipes objects
   * suitable for use in the chatStore. Ensures all required fields are present and
   * fills in missing properties with null or default values as needed.
   */
  data: MessageWithRecipesDTO[]
): MessageWithRecipes[] => {
  return data.map((message) => ({
    id: message.id,
    content: message.content,
    role: message.role,
    chatId: message.chatId,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    recipes:
      message.recipes?.map((r) => ({
        id: r.recipe.id,
        name: r.recipe.name,
        description: r.recipe.description ?? null,
        prepTime: r.recipe.prepTime ?? null,
        cookTime: r.recipe.cookTime ?? null,
        categories: r.recipe.categories ?? [],
        ingredients:
          r.recipe.ingredients?.map((ingredient) => ingredient.name) ?? [],
        instructions:
          r.recipe.instructions?.map(
            (instruction) => instruction.description
          ) ?? [],
        saved: r.recipe.saved ?? false
      })) ?? []
  }))
}

export const useChatAI = () => {
  const { chatId, setChatId } = chatStore()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const filters = useFiltersByUser()
  const filtersData = filters.data
  const utils = api.useUtils()

  const { addMessage, setMessages, setStreamingStatus, setStream } = chatStore()

  const filterStrings: string[] = []
  if (filtersData) {
    filtersData.forEach((filter) => {
      if (filter.checked) filterStrings.push(filter.name)
    })
  }

  const { mutate: upsertChat } = api.chats.upsert.useMutation({
    async onSuccess(data) {
      if (data.chatId) {
        setChatId(data.chatId)
      } else {
        const chatId = chatStore.getState().chatId
        utils.chats.getMessagesById.invalidate({ chatId })
      }
    },
    onError: (error) => {
      const stack = error.data?.stack
      if (stack) {
        toast.error(stack)
      } else {
        toast.error(error.message)
      }
    }
  })

  const handleUpsertMessage = () => {
    if (!isAuthenticated) {
      return
    }
    const lastTwoMessages = chatStore.getState().messages?.slice(-2) ?? []

    if (lastTwoMessages.length < 2) {
      return
    }

    const messages: UpsertChatSchema['messages'] = lastTwoMessages.map((m) => ({
      id: m.id,
      content: m.content,
      role: m.role,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      recipes: m.recipes.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        ingredients: r.ingredients,
        instructions: r.instructions
      }))
    }))

    upsertChat({
      chatId: chatStore.getState().chatId,
      messages
    })
  }

  const enabled = isAuthenticated && !!chatId

  const { status: queryStatus, data } = api.chats.getMessagesById.useQuery(
    { chatId: chatId ?? '' },
    {
      enabled,
      staleTime: Infinity
    }
  )

  // Create user message and add to store
  const createUserMessage = (message: MessageWithRecipes) => {
    addMessage(message)
  }

  // Handle AI response completion
  const handleAIResponse = useCallback(
    (aiResponse: OnFinish) => {
      if (aiResponse?.object?.content) {
        // Don't create a new generated recipe if the recipe already exists
        const messages = chatStore
          .getState()
          .messages?.flatMap((m) => m.recipes)
        const recipeNameToId = new Map<string, string>()
        for (const recipe of messages) {
          recipeNameToId.set(recipe.name, recipe.id)
        }
        const assistantMessage: MessageWithRecipes = {
          id: createId(),
          content: aiResponse.object.content,
          role: 'assistant',
          createdAt: new Date(),
          updatedAt: new Date(),
          chatId: chatId ?? '',
          recipes: (aiResponse.object?.recipes ?? []).map((recipe) => ({
            id: recipeNameToId.get(recipe?.name ?? '') ?? createId(),
            name: recipe?.name ?? '',
            description: recipe?.description ?? '',
            ingredients: recipe?.ingredients?.map((i) => i ?? '') ?? [],
            instructions: recipe?.instructions?.map((i) => i ?? '') ?? [],
            prepTime: recipe?.prepTime ?? '',
            cookTime: recipe?.cookTime ?? '',
            categories: recipe?.categories ?? [],
            saved: false
          }))
        }
        addMessage(assistantMessage)
      }
    },
    [chatId, addMessage, createId]
  )

  const { mutate: generated } = api.chats.generated.useMutation({
    onError: (error) => {
      const stack = error.data?.stack
      if (stack) {
        toast.error(stack)
      } else {
        toast.error(error.message)
      }
    }
  })

  // when user clicks recipe to generate, don't create a new recipe, just update the existing one
  const handleGenerated = () => {
    const lastMessage = chatStore.getState().messages?.at(-1)
    const chatId = chatStore.getState().chatId
    if (!lastMessage || !chatId) {
      return
    }
    console.log('lastMessage', lastMessage)
    console.log('chatId', chatId)
    const { id, ingredients, instructions, ...rest } = lastMessage.recipes[0]
    const data: Generated = {
      id,
      ingredients,
      instructions,
      prepTime: rest.prepTime ?? '',
      cookTime: rest.cookTime ?? '',
      messageId: lastMessage.id,
      content: lastMessage.content,
      chatId
    }
    generated(data)
  }

  const onFinishMessage = (aiResponse: OnFinish) => {
    const streamingStatus = chatStore.getState().streamingStatus
    handleAIResponse(aiResponse)
    if (streamingStatus === 'generating') {
      handleGenerated()
    } else if (streamingStatus === 'streaming') {
      handleUpsertMessage()
    }
    setStreamingStatus('idle')
    setStream({ content: '', recipes: [] })
  }

  useEffect(() => {
    if (queryStatus === 'success' && data) {
      setMessages(transformMessagesToChatStore(data.messages))
    }
  }, [queryStatus, data])

  return {
    // Actions
    createUserMessage,
    onFinishMessage
  }
}
