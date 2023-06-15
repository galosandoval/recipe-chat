import { zodResolver } from '@hookform/resolvers/zod'
import { Chat } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FormValues } from 'pages/_chat'
import {
  Dispatch,
  MouseEvent,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { useForm } from 'react-hook-form'
import { GeneratedRecipe, Message } from 'server/api/routers/recipe/interface'
import { api } from 'utils/api'
import { z } from 'zod'

function useGetChat(
  enabled: boolean,
  dispatch: Dispatch<ChatAction>,
  chatId: number
) {
  return api.chat.getMessagesByChatId.useQuery(
    { chatId },
    {
      enabled,
      onSuccess: (data) => {
        if (data?.messages.length) {
          dispatch({ type: 'loadedChat', payload: data.messages })
        }
      },
      staleTime: 0
    }
  )
}

export const useChat = () => {
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'

  const [state, dispatch, status] = useChatReducer(
    {
      messages: [],
      chatId:
        typeof localStorage.currentChatId === 'string'
          ? (JSON.parse(localStorage.currentChatId) as number)
          : undefined
    },
    isAuthenticated
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
    } else {
      localStorage.removeItem('currentChatId')
    }
  }, [state.chatId])

  const {
    formState: { isDirty, isValid },
    register,
    handleSubmit,
    setValue,
    clearErrors,
    reset
  } = useForm<ChatRecipeParams>({
    resolver: zodResolver(sendMessageFormSchema)
  })

  const recipeFilters = useRecipeFilters()

  const utils = api.useContext()
  utils.recipe.entity.prefetch()

  const chatRef = useRef<HTMLDivElement>(null)

  const handleScrollIntoView = () => {
    chatRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  const { mutate } = useSendMessageMutation(dispatch, handleScrollIntoView)
  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setValue('message', e.currentTarget.innerText.toLowerCase(), {
      shouldValidate: true,
      shouldDirty: true
    })
    clearErrors()
  }

  const handleStartNewChat = () => {
    dispatch({ type: 'reset', payload: undefined })
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

  const onSubmit = (values: ChatRecipeParams) => {
    dispatch({
      type: 'add',
      payload: { content: values.message, role: 'user' }
    })

    dispatch({
      type: 'loadingMessage',
      payload: { content: '', role: 'assistant', isLoading: true }
    })

    reset()

    const filters = recipeFilters.checkedFilters

    const convo = state?.messages
      .map((m) => {
        let content: string
        if (typeof m.content === 'string') {
          content = m.content
        } else {
          content = JSON.stringify(m.content)
        }

        return { ...m, content }
      })
      .filter((m) => m.content !== '')

    mutate({
      content: values.message,
      messages: convo,
      filters,
      chatId: state.chatId
    })
  }

  return {
    isDirty,
    isValid,
    chatRef,
    recipeFilters,
    state,
    status,
    chats,
    isChatsModalOpen,

    handleToggleChatsModal,
    handleChangeChat,
    handleStartNewChat,
    handleScrollIntoView,
    handleFillMessage,
    onSubmit,
    handleSubmit,
    register
  }
}

export type ChatsType = ReturnType<typeof useChat>['chats']

type ChatState = {
  messages: Message[]
  chatId?: number
}

function useChatReducer(initialState: ChatState, isAuthenticated: boolean) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { status } = useGetChat(
    isAuthenticated && !!state.chatId,
    dispatch,
    state.chatId || 0
  )

  return [state, dispatch, status] as const
}

type ChatAction =
  | {
      type: 'add' | 'loadingMessage' | 'loadedMessage'
      payload: Message & { error?: string; isLoading?: boolean }
    }
  | {
      type: 'loadedChat'
      payload: Message[]
    }
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
    case 'add':
      return {
        ...state,
        messages: [...state.messages, payload]
      }

    case 'loadingMessage':
      return {
        ...state,
        messages: [...state.messages, payload]
      }

    case 'loadedMessage':
      const newMessages = state.messages.slice(0, -1)
      return {
        ...state,
        messages: [...newMessages, payload]
      }

    case 'loadedChat':
      return {
        ...state,
        messages: action.payload || []
      }

    case 'chatIdChanged':
      return {
        ...state,
        chatId: action.payload
      }

    case 'reset':
      return {
        messages: [],
        chatId: undefined
      }

    default:
      return state
  }
}

export const errorMessage = 'Please try rephrasing your question.'

function useSendMessageMutation(
  dispatch: React.Dispatch<ChatAction>,
  handleScrollIntoView: () => void
) {
  const utils = api.useContext()

  return api.recipe.generate.useMutation({
    onSuccess: (data) => {
      dispatch({
        type: 'loadedMessage',
        payload: { content: JSON.stringify(data.recipe), role: 'assistant' }
      })
      dispatch({
        type: 'chatIdChanged',
        payload: data.chatId
      })

      utils.chat.getChats.invalidate()
    },
    onError: () => {
      dispatch({
        type: 'loadedMessage',
        payload: {
          content: '',
          role: 'assistant',
          error: errorMessage
        }
      })
    },
    onMutate: () => handleScrollIntoView(),
    onSettled: () => handleScrollIntoView()
  })
}

export type UseGenerate = ReturnType<typeof useSendMessageMutation>

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

export const useCreateRecipe = (data: GeneratedRecipe) => {
  const router = useRouter()
  const utils = api.useContext()
  const { description, ingredients, instructions, name, cookTime, prepTime } =
    data
  const { mutate, isLoading, isSuccess } = api.recipe.create.useMutation({
    onSuccess: (data) => {
      router.push(`recipes/${data.id}?name=${encodeURIComponent(data.name)}`)
      utils.recipe.invalidate()
    }
  })

  const { handleSubmit, register, getValues } = useForm<FormValues>({
    defaultValues: {
      description,
      ingredients: ingredients?.join('\n'),
      instructions: instructions?.join('\n'),
      name,
      cookTime,
      prepTime
    }
  })

  const onSubmit = (values: FormValues) => {
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n')
    mutate({ ...values, ingredients, instructions })
  }

  return {
    isLoading,
    isSuccess,
    mutate,
    getValues,
    onSubmit,
    handleSubmit,
    register
  }
}
