import { zodResolver } from '@hookform/resolvers/zod'
import { Chat, Message } from '@prisma/client'
import { Message as AiMessage } from 'ai'
import { useChat as useAiChat } from 'ai/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  FormEvent,
  MouseEvent,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { useForm } from 'react-hook-form'
import { api } from 'utils/api'
import { z } from 'zod'

function useGetChat(
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
      },
      staleTime: 0
    }
  )
}

export const useChat = () => {
  const utils = api.useContext()
  utils.recipe.entity.prefetch()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'

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

  const { status } = useGetChat(
    isAuthenticated && !!state.chatId,
    setMessages,
    state.chatId || 0
  )

  const chats = api.chat.getChats.useQuery(undefined, {
    onSuccess: (data) => {
      if (typeof localStorage.currentChatId !== 'string') {
        dispatch({ type: 'chatIdChanged', payload: data[0]?.id })
      }
    },
    staleTime: 0
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

  const handleScrollIntoView = () => {
    chatRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setInput(e.currentTarget.innerText.toLowerCase())
  }

  const handleStartNewChat = () => {
    setMessages([])
    dispatch({ type: 'chatIdChanged', payload: undefined })
  }

  const handleToggleChatsModal = () => {
    setIsChatsModalOpen((state) => !state)
  }

  const handleChangeChat = (
    chat: Chat & {
      messages: Message[]
    }
  ) => {
    dispatch({ type: 'chatIdChanged', payload: chat.id })
    handleToggleChatsModal()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (isSendingMessage) {
      stop()
    } else {
      submitMessages(event)
    }
  }
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

    handleInputChange,
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
  useEffect(() => {
    console.log('state.chatId', state.chatId)
  }, [state?.chatId])

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

type CreateFilter = z.infer<typeof createFilterSchema>
type Filters = Record<string, boolean>

const createFilterSchema = z.object({
  name: z.string().min(3).max(50)
})

function useRecipeFilters() {
  const [filters, setFilters] = useState<Filters>(
    typeof window !== 'undefined' &&
      typeof localStorage.checkedFilters === 'string'
      ? (JSON.parse(localStorage.checkedFilters) as Filters)
      : {}
  )
  const [canDelete, setCanDelete] = useState(false)

  const filtersArr = Object.keys(filters)

  const checkedFilters: string[] = []
  for (const [filter, checked] of Object.entries(filters)) {
    if (checked) {
      checkedFilters.push(filter)
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid }
  } = useForm<CreateFilter>({
    resolver: zodResolver(createFilterSchema)
  })

  const handleToggleCanDelete = () => {
    setCanDelete((prev) => !prev)
  }

  const handleCheck = (filter: string) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }))
  }

  const handleRemoveFilter = (filter: string) => {
    setFilters((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [filter]: _, ...rest } = prev
      return rest
    })
  }

  const onSubmit = (data: CreateFilter) => {
    setCanDelete(false)

    setFilters((prev) => ({ ...prev, [data.name]: true }))

    reset()
  }

  useEffect(() => {
    localStorage.checkedFilters = JSON.stringify(filters)
  }, [filters])

  return {
    filters,
    filtersArr,
    handleCheck,
    handleSubmit,
    onSubmit,
    register,
    canDelete,
    handleToggleCanDelete,
    handleRemoveFilter,
    isBtnDisabled: !isDirty || !isValid,
    checkedFilters
  }
}

export type UseRecipeFilters = ReturnType<typeof useRecipeFilters>

const sendMessageFormSchema = z.object({ message: z.string().min(6) })
export type ChatRecipeParams = z.infer<typeof sendMessageFormSchema>

export const useSaveRecipe = (chatId?: number) => {
  const utils = api.useContext()
  const { mutate, status, data } = api.recipe.create.useMutation({
    onSuccess: () => {
      utils.recipe.invalidate()
      if (chatId) {
        utils.chat.getMessagesByChatId.invalidate({ chatId })
      }
    }
  })

  const router = useRouter()

  const handleGoToRecipe = ({
    recipeId,
    recipeName
  }: {
    recipeId: number | null
    recipeName?: string
  }) => {
    if (recipeId && recipeName) {
      router.push(`recipes/${recipeId}?name=${encodeURIComponent(recipeName)}`)
    }
  }

  const handleSaveRecipe = ({
    content,
    messageId
  }: {
    content: string
    messageId: number
  }) => {
    if (!content) return

    let name = ''
    const nameIdx = content.toLowerCase().indexOf('name:')
    if (nameIdx !== -1) {
      const endIdx = content.indexOf('\n', nameIdx)
      if (endIdx !== -1) {
        name = content.slice(nameIdx + 6, endIdx)
      }
    }

    let description = ''
    const descriptionIdx = content
      .toLowerCase()
      .indexOf('description:', nameIdx)
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
  }

  return {
    status,
    data,
    handleSaveRecipe,
    handleGoToRecipe
  }
}

export type SaveRecipe = ReturnType<typeof useSaveRecipe>

function removeLeadingHyphens(str: string) {
  if (str && str[0] === '-') {
    return str.slice(2)
  }

  return str
}
