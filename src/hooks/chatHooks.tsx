import { Chat, Message } from '@prisma/client'
import { Message as AiMessage } from 'ai'
import { useChat as useAiChat } from 'ai/react'
import { useRecipeFilters } from 'components/RecipeFilters'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import { toast } from 'react-hot-toast'
import { api } from 'utils/api'
import { z } from 'zod'

export type FormValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepTime: string
  cookTime: string
}

function useGetMessagesByChatId(
  enabled: boolean,
  setMessages: (messages: AiMessage[]) => void,
  chatId: number
) {
  return api.chat.getMessagesByChatId.useQuery(
    { chatId },
    {
      enabled,
      onSuccess: (data) => {
        if (data?.messages.length) {
          setMessages(
            data.messages.map((m) => ({ ...m, id: JSON.stringify(m.id) }))
          )
        }
      }
    }
  )
}

export const useChat = () => {
  const { status: authStatus, data } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const utils = api.useContext()

  const chats = api.chat.getChats.useQuery(
    { userId: data?.user.id || 0 },
    {
      onSuccess: (data) => {
        if (typeof localStorage.currentChatId !== 'string') {
          dispatch({ type: 'chatIdChanged', payload: data[0]?.id })
        }
      },
      enabled: isAuthenticated
    }
  )

  const [state, dispatch] = useChatReducer({
    chatId: undefined
  })

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    stop,
    handleSubmit: submitMessages,
    isLoading: isSendingMessage,
    setMessages
  } = useAiChat({
    onFinish: (message) => {
      if (isAuthenticated) {
        mutate({
          messages: [{ content: input, role: 'user' }, message],
          chatId: state.chatId
        })
      }
    }
  })

  const { status } = useGetMessagesByChatId(
    isAuthenticated && !!state.chatId,
    setMessages,
    state.chatId || 0
  )

  const { mutate } = api.chat.addMessages.useMutation({
    onSuccess(data, { chatId }) {
      if (!chatId) {
        const payload = data as Message[]
        if (payload.length) {
          dispatch({
            type: 'chatIdChanged',
            payload: payload[0].chatId
          })
        }
      }

      utils.chat.invalidate()
    }
  })

  useEffect(() => {
    if (state.chatId) {
      localStorage.currentChatId = JSON.stringify(state.chatId)
    }
  }, [state.chatId])

  useEffect(() => {
    if (
      typeof window !== undefined &&
      typeof localStorage.currentChatId === 'string'
    ) {
      dispatch({
        type: 'chatIdChanged',
        payload: JSON.parse(localStorage.currentChatId) as number
      })
    }
  }, [dispatch])

  const chatRef = useRef<HTMLDivElement>(null)

  const handleScrollIntoView = useCallback(() => {
    chatRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [])

  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)

  const handleFillMessage = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    setInput(e.currentTarget.innerText.toLowerCase())
  }, [])

  const handleStartNewChat = useCallback(() => {
    setMessages([])
    dispatch({ type: 'chatIdChanged', payload: undefined })
  }, [])

  const handleToggleChatsModal = useCallback(() => {
    setIsChatsModalOpen((state) => !state)
  }, [])

  const handleChangeChat = useCallback(
    (
      chat: Chat & {
        messages: Message[]
      }
    ) => {
      dispatch({ type: 'chatIdChanged', payload: chat.id })
      handleToggleChatsModal()
    },
    []
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      if (isSendingMessage) {
        stop()
      } else {
        submitMessages(event)
      }
    },
    [isSendingMessage, stop, submitMessages]
  )

  const recipeFilters = useRecipeFilters()

  return {
    chatRef,
    recipeFilters,
    state,
    status,
    chats,
    isChatsModalOpen,
    input,
    messages,
    isSendingMessage,

    handleInputChange: useCallback(handleInputChange, []),
    handleToggleChatsModal,
    handleChangeChat,
    handleStartNewChat,
    handleScrollIntoView,
    handleFillMessage,
    handleSubmit
  }
}

export type ChatsType = ReturnType<typeof useChat>['chats']

type ChatState = {
  chatId?: number
}

function useChatReducer(initialState: ChatState) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  return [state, dispatch] as const
}

type ChatAction =
  | {
      type: 'chatIdChanged'
      payload: number | undefined
    }
  | {
      type: 'reset'
      payload: undefined
    }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  const { type, payload } = action
  switch (type) {
    case 'chatIdChanged':
      return {
        ...state,
        chatId: payload
      }

    case 'reset':
      return {
        chatId: undefined
      }

    default:
      return state
  }
}

export const errorMessage = 'Please try rephrasing your question.'

const sendMessageFormSchema = z.object({ message: z.string().min(6) })
export type ChatRecipeParams = z.infer<typeof sendMessageFormSchema>

export type SaveRecipe = ReturnType<typeof useSaveRecipe>

export const useSaveRecipe = (chatId?: number) => {
  const utils = api.useContext()
  const { mutate, status, data } = api.recipe.create.useMutation({
    onSuccess: () => {
      utils.recipe.invalidate()
      if (chatId) {
        utils.chat.getMessagesByChatId.invalidate({ chatId })
      }

      toast.success('Recipe saved successfully!')
    },
    onError: (error) => {
      toast.error('Error: ' + error.message)
    }
  })

  const router = useRouter()

  const memoizedData = useMemo(() => data, [data])

  const handleGoToRecipe = useCallback(
    ({
      recipeId,
      recipeName
    }: {
      recipeId: number | null
      recipeName?: string
    }) => {
      if (recipeId && recipeName) {
        router.push(
          `recipes/${recipeId}?name=${encodeURIComponent(recipeName)}`
        )
      }
    },
    []
  )

  const handleSaveRecipe = useCallback(
    ({ content, messageId }: { content: string; messageId: number }) => {
      if (!content) return

      const {
        name,
        description,
        cookTime,
        prepTime,
        ingredients,
        instructions
      } = transformContentToRecipe(content)

      mutate({
        name,
        description,
        prepTime,
        cookTime,
        instructions: removeLeadingHyphens(instructions)
          .split('\n')
          .filter(Boolean),
        ingredients: ingredients
          .split('\n')
          .map((s) => removeLeadingHyphens(s))
          .filter(Boolean),
        messageId
      })
    },
    []
  )

  return {
    status,
    data: memoizedData,

    handleSaveRecipe,
    handleGoToRecipe
  }
}

function transformContentToRecipe(content: string) {
  let name = ''
  const nameIdx = content.toLowerCase().indexOf('name:')
  if (nameIdx !== -1) {
    const endIdx = content.indexOf('\n', nameIdx)
    if (endIdx !== -1) {
      name = content.slice(nameIdx + 6, endIdx)
    }
  }

  let description = ''
  const descriptionIdx = content.toLowerCase().indexOf('description:', nameIdx)
  if (descriptionIdx !== -1) {
    const endIdx = content.indexOf('\n', descriptionIdx)
    if (endIdx !== -1) {
      description = content.slice(descriptionIdx + 13, endIdx)
    }
  }

  let prepTime = ''
  const prepTimeIdx = content.toLowerCase().indexOf('preparation time:')
  if (prepTimeIdx !== -1) {
    const endIdx = content.indexOf('\n', prepTimeIdx)
    if (endIdx !== -1) {
      prepTime = content.slice(prepTimeIdx + 18, endIdx)
    }
  }

  let cookTime = ''
  const cookTimeIdx = content.toLowerCase().indexOf('cook time:')
  if (cookTimeIdx !== -1) {
    const endIdx = content.indexOf('\n', cookTimeIdx)
    if (endIdx !== -1) {
      cookTime = content.slice(cookTimeIdx + 11, endIdx)
    }
  }

  let instructions = ''
  const instructionsIdx = content.toLowerCase().indexOf('instructions:')
  if (instructionsIdx !== -1) {
    const endIdx = content.indexOf('\n\n', instructionsIdx)
    if (endIdx !== -1) {
      instructions = content.slice(instructionsIdx + 14, endIdx)
    }
  }

  let ingredients = ''
  const ingredientsIdx = content.toLowerCase().indexOf('ingredients:')
  if (ingredientsIdx !== -1) {
    if (instructionsIdx !== -1) {
      ingredients = content.slice(ingredientsIdx + 13, instructionsIdx - 2)
    }
  }

  return { name, description, prepTime, cookTime, instructions, ingredients }
}

function removeLeadingHyphens(str: string) {
  if (str && str[0] === '-') {
    return str.slice(2)
  }

  return str
}
