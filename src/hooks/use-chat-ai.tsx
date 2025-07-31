import { useSession } from 'next-auth/react'
import { useFiltersByUser } from '~/components/recipe-filters'
import { api } from '~/trpc/react'
import { chatStore } from '~/stores/chat-store'
import { createId } from '@paralleldrive/cuid2'
import { useCallback, useEffect } from 'react'
import type {
  generatedMessageSchema,
  MessageWithRecipes,
  MessageWithRecipesDTO
} from '~/schemas/chats'
import type { GeneratedRecipeWithId } from '~/schemas/messages'
import { type Experimental_UseObjectHelpers as UseObjectHelpers } from '@ai-sdk/react'
import { toast } from '~/components/toast'

type Object = UseObjectHelpers<typeof generatedMessageSchema, string>['object']
type Error = UseObjectHelpers<typeof generatedMessageSchema, string>['error']
type OnFinish = { object: Object; error: Error }

/**
 * Transforms database message data to the format expected by chatStore
 */
const transformMessagesToChatStore = (
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
      message.recipes?.map(
        (r): GeneratedRecipeWithId => ({
          id: r.recipe.id,
          name: r.recipe.name,
          description: r.recipe.description || '',
          prepTime: r.recipe.prepTime,
          cookTime: r.recipe.cookTime,
          categories: r.recipe.categories || [],
          ingredients:
            r.recipe.ingredients?.map((ingredient) => ingredient.name) || [],
          instructions:
            r.recipe.instructions?.map(
              (instruction) => instruction.description
            ) || []
        })
      ) || []
  }))
}

export const useChatAI = () => {
  const { chatId, setChatId } = chatStore()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const filters = useFiltersByUser()
  const filtersData = filters.data
  const utils = api.useUtils()

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
    const messages = chatStore.getState().messages?.slice(-2) ?? []
    console.log('handleUpsertMessage', messages)
    if (!isAuthenticated) {
      return
    }

    upsertChat({
      chatId: chatStore.getState().chatId,
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
        const assistantMessage: MessageWithRecipes = {
          id: createId(),
          content: aiResponse.object.content,
          role: 'assistant',
          createdAt: new Date(),
          updatedAt: new Date(),
          chatId: chatId ?? '',
          recipes: (aiResponse.object?.recipes ?? []).map(
            (recipe) =>
              ({
                id: createId(),
                name: recipe?.name ?? '',
                description: recipe?.description ?? '',
                ingredients: recipe?.ingredients ?? [],
                instructions: recipe?.instructions ?? [],
                prepTime: recipe?.prepTime ?? '',
                cookTime: recipe?.cookTime ?? '',
                categories: recipe?.categories ?? []
              }) as GeneratedRecipeWithId
          )
        }
        addMessage(assistantMessage)
      }
    },
    [chatId, addMessage, createId]
  )

  useEffect(() => {
    if (queryStatus === 'success' && data) {
      setMessages(transformMessagesToChatStore(data.messages))
    }
  }, [queryStatus, data])

  return {
    // Actions
    createUserMessage,
    handleAIResponse,
    onFinishMessage
  }
}
