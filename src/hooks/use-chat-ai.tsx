import { useSession } from 'next-auth/react'
import { useSessionChatId } from './use-session-chat-id'
import { useFiltersByUser } from '~/components/recipe-filters'
import { api } from '~/trpc/react'
import { chatStore } from '~/stores/chat-store'
import { createId } from '@paralleldrive/cuid2'
import { useCallback, useEffect } from 'react'
import type {
  generatedMessageSchema,
  MessageWithRecipes
} from '~/schemas/chats'
import type { GeneratedRecipe } from '~/schemas/messages'
import { type Experimental_UseObjectHelpers as UseObjectHelpers } from '@ai-sdk/react'

type Object = UseObjectHelpers<typeof generatedMessageSchema, string>['object']
type Error = UseObjectHelpers<typeof generatedMessageSchema, string>['error']
type OnFinish = { object: Object; error: Error }

/**
 * Transforms database message data to the format expected by chatStore
 */
const transformMessagesToChatStore = (data: any): MessageWithRecipes[] => {
  // Handle different response structures from upsertChat
  let messages: any[] = []

  if (data?.messages) {
    // If data.messages is an array, use it directly
    if (Array.isArray(data.messages)) {
      messages = data.messages
    } else if (
      data.messages.messages &&
      Array.isArray(data.messages.messages)
    ) {
      // If data.messages is an object with a messages property (from getMessagesById)
      messages = data.messages.messages
    }
  }

  if (!messages.length) return []

  return messages.map((message) => ({
    id: message.id,
    content: message.content,
    role: message.role,
    chatId: message.chatId,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    recipes:
      message.recipes?.map(
        (recipe: any): GeneratedRecipe => ({
          name: recipe.name,
          description: recipe.description || '',
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          categories: recipe.categories || [],
          ingredients:
            recipe.ingredients?.map((ingredient: any) => ingredient.name) || [],
          instructions:
            recipe.instructions?.map(
              (instruction: any) => instruction.description
            ) || []
        })
      ) || []
  }))
}

export const useChatAI = () => {
  const [sessionChatId, changeChatId] = useSessionChatId()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const filters = useFiltersByUser()
  const filtersData = filters.data

  const { addMessage, setMessages } = chatStore()

  const filterStrings: string[] = []
  if (filtersData) {
    filtersData.forEach((filter) => {
      if (filter.checked) filterStrings.push(filter.name)
    })
  }

  const { mutate: upsertChat } = api.chats.upsert.useMutation({
    async onSuccess(data) {
      if (data.chatId) {
        changeChatId(data.chatId)
      }
    }
  })

  const handleUpsertMessage = () => {
    const messages = chatStore.getState().messages?.slice(-2) ?? []
    console.log('handleUpsertMessage', messages)
    if (!isAuthenticated) {
      return
    }

    upsertChat({
      chatId: sessionChatId,
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        role: message.role,
        recipes: message.recipes ?? [],
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      }))
    })
  }

  const onFinishMessage = () => {
    const messages = chatStore.getState().messages
    if (!messages?.length) {
      throw new Error('No messages')
    }
    handleUpsertMessage()
  }

  const enabled = isAuthenticated && !!sessionChatId

  const { status: queryStatus, data } = api.chats.getMessagesById.useQuery(
    { chatId: sessionChatId ?? '' },
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
        const assistantMessage: MessageWithRecipes = {
          id: createId(),
          content: aiResponse.object.content,
          role: 'assistant',
          createdAt: new Date(),
          updatedAt: new Date(),
          chatId: sessionChatId ?? '',
          recipes: (aiResponse.object?.recipes ?? []).filter(
            (
              recipe
            ): recipe is {
              description: string
              name: string
              ingredients?: string[]
              instructions?: string[]
              prepTime?: string | null
              cookTime?: string | null
              categories?: string[]
            } =>
              !!recipe &&
              typeof recipe?.description === 'string' &&
              typeof recipe?.name === 'string'
          )
        }
        addMessage(assistantMessage)
      }
    },
    [sessionChatId, addMessage, createId]
  )

  useEffect(() => {
    if (queryStatus === 'success' && data) {
      setMessages(transformMessagesToChatStore(data))
    }
  }, [queryStatus, data])

  return {
    // Actions
    createUserMessage,
    handleAIResponse,
    onFinishMessage
  }
}
