import { zodResolver } from '@hookform/resolvers/zod'
import { Message as PrismaMessage } from '@prisma/client'
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

function useGetChat(enabled: boolean, dispatch: Dispatch<ChatAction>) {
  return api.chat.get.useQuery(undefined, {
    enabled,
    onSuccess: (data) => {
      if (data?.messages.length) {
        dispatch({ type: 'chatLoaded', payload: data.messages })
      }
    },
    staleTime: 0
  })
}

export type UseGetChat = ReturnType<typeof useGetChat>

export const useChat = () => {
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'

  const [state, dispatch, status, chatId] = useChatReducer(
    { messages: [] },
    isAuthenticated
  )
  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid },
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
    chatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const { mutate } = useSendMessageMutation(dispatch, handleScrollIntoView)

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setValue('message', e.currentTarget.innerText.toLowerCase(), {
      shouldValidate: true,
      shouldDirty: true
    })
    clearErrors()
  }

  const onSubmit = (values: ChatRecipeParams) => {
    dispatch({
      type: 'add',
      payload: { content: values.message, role: 'user' }
    })

    dispatch({
      type: 'loadingResponse',
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
      chatId
    })
  }

  return {
    isDirty,
    isValid,
    state,
    chatRef,
    handleScrollIntoView,
    handleFillMessage,
    onSubmit,
    handleSubmit,
    recipeFilters,
    register,
    status
  }
}

function useChatReducer(initialState: ChatState, isAuthenticated: boolean) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { status, data } = useGetChat(isAuthenticated, dispatch)

  console.log('data', data)

  return [state, dispatch, status, data?.id] as const
}

type ChatAction =
  | {
      type: 'add' | 'loadingResponse' | 'messageLoaded'
      payload: Message & { error?: string; isLoading?: boolean }
    }
  | {
      type: 'chatLoaded'
      payload: Message[]
    }

type ChatState = {
  messages: Message[]
}
function chatReducer(state: ChatState, action: ChatAction) {
  const { type, payload } = action
  switch (type) {
    case 'add':
      return {
        ...state,
        messages: [...state.messages, payload]
      }

    case 'loadingResponse':
      return {
        ...state,
        messages: [...state.messages, payload]
      }

    case 'messageLoaded':
      const newMessages = state.messages.slice(0, -1)
      return {
        ...state,
        messages: [...newMessages, payload]
      }

    case 'chatLoaded':
      return {
        ...state,
        messages: action.payload
      }

    default:
      return state
  }
}

export const errorMessage = 'Please try rephrasing your request.'

function useSendMessageMutation(
  dispatch: React.Dispatch<ChatAction>,
  handleScrollIntoView: () => void
) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const utils = api.useContext()

  return api.recipe.generate.useMutation({
    onSuccess: (data) => {
      // if (isAuthenticated) {
      //   utils.chat.get.setData(undefined, (old) => {
      //     if (old?.messages && old.messages.length) {
      //       const chatId = old.messages[0].chatId
      //       const messages: PrismaMessage[] = [
      //         ...old.messages,
      //         {
      //           chatId,
      //           content: JSON.stringify(data.recipe),
      //           createdAt: new Date(),
      //           id: Infinity,
      //           role: 'assistant',
      //           updatedAt: new Date()
      //         }
      //       ]

      //       return {
      //         ...old,
      //         messages
      //       }
      //     }

      //     return old
      //   })
      // } else {
      //   const newMessage = data.recipe
      //   if (newMessage) {
      dispatch({
        type: 'messageLoaded',
        payload: { content: JSON.stringify(data.recipe), role: 'assistant' }
      })
      // }
      // }
    },
    onError: () => {
      dispatch({
        type: 'messageLoaded',
        payload: {
          content: '',
          role: 'assistant',
          error: errorMessage
        }
      })
    },
    onMutate: ({ content }) => {
      if (isAuthenticated) {
        utils.chat.get.setData(undefined, (old) => {
          if (old?.messages && old.messages.length) {
            const chatId = old.messages[0].chatId
            const messages: PrismaMessage[] = [
              ...old.messages,
              {
                chatId,
                content,
                createdAt: new Date(),
                id: Infinity,
                role: 'user',
                updatedAt: new Date()
              }
            ]

            return {
              ...old,
              messages
            }
          } else if (old?.messages) {
            return {
              ...old,
              messages: [
                ...old.messages,
                {
                  chatId: old.id,
                  content,
                  createdAt: new Date(),
                  id: Infinity,
                  role: 'user',
                  updatedAt: new Date()
                }
              ]
            }
          }

          return old
        })
      }
      setTimeout(() => {
        handleScrollIntoView()
      })
    },
    onSettled: () => setTimeout(() => handleScrollIntoView())
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
