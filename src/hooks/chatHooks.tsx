import { zodResolver } from '@hookform/resolvers/zod'
import { Chat, Message, Prisma } from '@prisma/client'
import { Message as AiMessage } from 'ai'
import { useChat as useAiChat } from 'ai/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FormValues } from 'pages/chat'
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { useForm } from 'react-hook-form'
import { GeneratedRecipe } from 'server/api/routers/recipe/interface'
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
      console.log('data', data)

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
      console.log('messages', messages)
      console.log('input', input)
      console.log('message', message)

      if (isAuthenticated) {
        mutate({
          messages: [{ content: input, role: 'user' }, message],
          chatId: state.chatId
        })
      }
    }
  })

  const { status, data } = useGetChat(
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

  // const {
  //   formState: { isDirty, isValid },
  //   register,
  //   handleSubmit,
  //   setValue,
  //   clearErrors,
  //   reset,
  //   watch
  // } = useForm<ChatRecipeParams>({
  //   resolver: zodResolver(sendMessageFormSchema),
  //   defaultValues: {
  //     message: input
  //   }
  // })

  const chatRef = useRef<HTMLDivElement>(null)

  const handleScrollIntoView = () => {
    chatRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  // const { mutate } = useSendMessageMutation(dispatch, handleScrollIntoView)
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
    // dispatch({
    //   type: 'add',
    //   payload: { content: values.message, role: 'user' }
    // })

    // dispatch({
    //   type: 'loadingMessage',
    //   payload: { content: '', role: 'assistant', isLoading: true }
    // })
    console.log('event')
    // setInput('')

    // const filters = recipeFilters.checkedFilters

    // const convo = state?.messages
    //   .map((m) => {
    //     let content: string
    //     if (typeof m.content === 'string') {
    //       content = m.content
    //     } else {
    //       content = JSON.stringify(m.content)
    //     }

    //     return { ...m, content }
    //   })
    //   .filter((m) => m.content !== '')
    if (isSendingMessage) {
      stop()
    } else {
      submitMessages(event)
    }

    // const response = await fetch('/api/generate', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     prompt: values.message,
    //     messages: convo,
    //     filters
    //   }),
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })

    // if (response.ok && response.body) {
    // const reader = response.body.getReader()
    // const decoder = new TextDecoder()

    // function onParse(event: ParseEvent) {
    //   if (event.type === 'event') {
    //     try {
    //       const data = JSON.parse(event.data) as {
    //         choices: {
    //           index: number
    //           finish_reason: string | null
    //           delta: {
    //             content: string
    //           }
    //         }[]
    //         created: string
    //         id: string
    //         model: string
    //         object: string
    //       }

    //       data.choices
    //         .filter(({ delta }) => !!delta.content)
    //         .forEach(({ delta }) => {
    //           setText((prev) => {
    //             return `${prev || ''}${delta.content}`
    //           })
    //         })
    //     } catch (e) {
    //       console.log(e)
    //     }
    //   }
    // }

    // const parser = createParser(onParse)

    // while (true) {
    //   const { value, done } = await reader.read()
    //   const dataString = decoder.decode(value)
    //   if (done || dataString.includes('[DONE]')) break
    //   parser.feed(dataString)
    // }
    // }
    // mutate({
    //   content: values.message,
    //   messages: convo,
    //   filters,
    //   chatId: state.chatId
    // })
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
  // const { status } = useGetChat(
  //   isAuthenticated && !!state.chatId,
  //   dispatch,
  //   state.chatId || 0
  // )

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

// function useSendMessageMutation(
//   dispatch: React.Dispatch<ChatAction>,
//   handleScrollIntoView: () => void
// ) {
//   const utils = api.useContext()

//   return api.recipe.generate.useMutation({
//     onSuccess: (data) => {
//       dispatch({
//         type: 'loadedMessage',
//         payload: { content: JSON.stringify(data.recipe), role: 'assistant' }
//       })
//       dispatch({
//         type: 'chatIdChanged',
//         payload: data.chatId
//       })

//       utils.chat.getChats.invalidate()
//     },
//     onError: () => {
//       dispatch({
//         type: 'loadedMessage',
//         payload: {
//           content: '',
//           role: 'assistant',
//           error: errorMessage
//         }
//       })
//     },
//     onMutate: () => handleScrollIntoView(),
//     onSettled: () => handleScrollIntoView()
//   })
// }

// export type UseGenerate = ReturnType<typeof useSendMessageMutation>

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
