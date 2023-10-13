import { Chat, Message } from '@prisma/client'
import { useChat as useAiChat, Message as AiMessage } from 'ai/react'
import { useFilters } from 'components/recipe-filters'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react'
import { toast } from 'react-hot-toast'
import { api } from 'utils/api'
import { z } from 'zod'
import { useTranslation } from './useTranslation'

export type FormValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepTime: string
  cookTime: string
  notes: string
}

export type ChatType = ReturnType<typeof useChat>

export const useChat = () => {
  const [state, dispatch] = useChatReducer({
    chatId: undefined
  })
  const router = useRouter()
  const { status: authStatus, data } = useSession()
  const filters = useFilters()

  const isAuthenticated = authStatus === 'authenticated'
  const userId = data?.user.id
  const utils = api.useContext()

  const filtersData = filters.data

  const filterStrings: string[] = []

  if (filtersData) {
    filtersData.forEach((filter) => {
      if (filter.checked) filterStrings.push(filter.name)
    })
  }

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
    onFinish: (messages) => onFinishMessage(messages),

    body: {
      filters: filterStrings
    }
  })

  const { mutate: addMessages } = api.chat.addMessages.useMutation({
    onSuccess(data) {
      const messages = data.map((m) => ({
        content: m.content,
        id: m.id,
        role: m.role,
        recipeId: m.recipeId
      }))

      setMessages(messages)
      utils.chat.getMessagesById.invalidate({ chatId: state.chatId })
    }
  })

  const { mutate: create } = api.chat.create.useMutation({
    onSuccess(data) {
      dispatch({ type: 'chatIdChanged', payload: data.id })
      const messages = data.messages.map((m) => ({
        content: m.content,
        id: m.id,
        role: m.role,
        recipeId: m.recipeId
      }))

      setMessages(messages)
      utils.chat.getMessagesById.invalidate({ chatId: data.id })
    }
  })

  function onFinishMessage(message: AiMessage) {
    if (isAuthenticated) {
      if (!!state.chatId) {
        addMessages({
          messages: [{ content: input, role: 'user' }, message as Message],
          chatId: state.chatId
        })
      } else {
        create({
          messages: [{ content: input, role: 'user' }, message as Message]
        })
      }
    }
  }

  const [shouldFetchChat, setShouldFetchChat] = useState(true)

  const enabled = isAuthenticated && !!state.chatId && shouldFetchChat

  const { status, fetchStatus } = api.chat.getMessagesById.useQuery(
    { chatId: state.chatId || '' },
    {
      enabled,
      onSuccess: (data) => {
        if (data) {
          setMessages(data.messages)
        }
      },
      keepPreviousData: true
    }
  )

  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)

  const handleGetChatsOnSuccess = useCallback(
    (
      data: (Chat & {
        messages: Message[]
      })[]
    ) => {
      if (
        typeof sessionStorage.getItem('currentChatId') !== 'string' &&
        data[0]?.id
      ) {
        dispatch({ type: 'chatIdChanged', payload: data[0].id })
      }
    },
    []
  )

  const handleChangeChat = useCallback(
    (
      chat: Chat & {
        messages: Message[]
      }
    ) => {
      dispatch({ type: 'chatIdChanged', payload: chat.id })
      setShouldFetchChat(true)
      handleToggleChatsModal()
    },
    []
  )

  const handleFillMessage = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    setInput(e.currentTarget.innerText.toLowerCase())
  }, [])

  const handleStartNewChat = useCallback(() => {
    stop()
    setMessages([])
    dispatch({ type: 'chatIdChanged', payload: '' })
  }, [])

  const handleToggleChatsModal = useCallback(() => {
    setIsChatsModalOpen((state) => !state)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      setShouldFetchChat(false)

      if (isSendingMessage) {
        stop()
      } else {
        submitMessages(event, { options: {} })
      }
    },

    [isSendingMessage, stop, submitMessages]
  )

  useEffect(() => {
    if (userId) {
      utils.chat.getChats.prefetch({ userId })
      router.push('/chat')
    }
  }, [userId])

  useEffect(() => {
    if (
      typeof window !== undefined &&
      typeof sessionStorage?.getItem('currentChatId') === 'string'
    ) {
      const currentChatId = sessionStorage.getItem('currentChatId')

      dispatch({
        type: 'chatIdChanged',
        payload:
          currentChatId !== undefined
            ? JSON.parse(currentChatId as string)
            : undefined
      })
    }
  }, [])

  const {
    handleGoToRecipe,
    handleSaveRecipe,
    status: saveRecipeStatus
  } = useSaveRecipe(messages, setMessages)

  return {
    filters,
    chatId: state.chatId,
    fetchStatus,
    status,
    isChatsModalOpen,
    input,
    messages,
    isSendingMessage,
    isAuthenticated,
    saveRecipeStatus,

    handleGoToRecipe,
    handleSaveRecipe,

    handleGetChatsOnSuccess,
    handleInputChange: useCallback(handleInputChange, []),
    handleToggleChatsModal,
    handleChangeChat,
    handleStartNewChat,
    handleFillMessage,
    handleSubmit
  }
}

type ChatState = {
  chatId?: string
}

function useChatReducer(initialState: ChatState) {
  const [state, dispatch] = useReducer(
    (state: ChatState, action: ChatAction) => {
      const { type, payload } = action
      switch (type) {
        case 'chatIdChanged':
          sessionStorage.setItem('currentChatId', JSON.stringify(payload))

          return {
            ...state,
            chatId: payload
          }

        default:
          return state
      }
    },
    initialState
  )

  return [state, dispatch] as const
}

type ChatAction =
  | {
      type: 'chatIdChanged'
      payload: string | undefined
    }
  | {
      type: 'reset'
      payload: undefined
    }

export const errorMessage = 'Please try rephrasing your question.'

const sendMessageFormSchema = z.object({ message: z.string().min(6) })
export type ChatRecipeParams = z.infer<typeof sendMessageFormSchema>

export type SaveRecipe = ReturnType<typeof useSaveRecipe>

export const useSaveRecipe = (
  messages: AiMessage[],
  setMessages: (messages: AiMessage[]) => void
) => {
  const t = useTranslation()

  const router = useRouter()

  const utils = api.useContext()

  const {
    mutate: createRecipe,
    status,
    data
  } = api.recipe.create.useMutation({
    onSuccess: (newRecipe, { messageId }) => {
      utils.recipe.invalidate()
      const messagesCopy = [...messages]
      if (messageId) {
        const messageToChange = messagesCopy.find(
          (message) => message.id === messageId
        ) as Message
        if (messageToChange) {
          messageToChange.recipeId = newRecipe.id
        }
      }

      setMessages(messagesCopy)

      toast.success(t('chat-window.save-success'))
    },
    onError: (error) => {
      toast.error('Error: ' + error.message)
    }
  })

  const memoizedData = useMemo(() => data, [data])

  const handleGoToRecipe = useCallback(
    ({
      recipeId,
      recipeName
    }: {
      recipeId: string | null
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
    ({ content, messageId }: { content: string; messageId?: string }) => {
      if (!content) return

      const {
        name,
        description,
        cookTime,
        prepTime,
        ingredients,
        instructions
      } = transformContentToRecipe({ content, locale: router.locale })

      createRecipe({
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

function transformContentToRecipe({
  content,
  locale
}: {
  content: string
  locale?: string
}) {
  const {
    cookTimeField,
    descriptionField,
    ingredientsField,
    instructionsField,
    prepTimeField,
    nameField
  } = getTranslatedFields({ locale })

  const nameIdx = content.toLowerCase().indexOf(nameField)

  let name = ''

  if (nameIdx !== -1) {
    const endIdx = content.indexOf('\n', nameIdx)

    if (endIdx !== -1) {
      name = content.slice(nameIdx + nameField.length + 1, endIdx)
    }
  }

  const descriptionIdx = content
    .toLowerCase()
    .indexOf(descriptionField, nameIdx)

  let description = ''

  if (descriptionIdx !== -1) {
    const endIdx = content.indexOf('\n', descriptionIdx)
    if (endIdx !== -1) {
      description = content.slice(
        descriptionIdx + descriptionField.length + 1,
        endIdx
      )
    }
  }

  const prepTimeIdx = content.toLowerCase().indexOf(prepTimeField)

  let prepTime = ''

  if (prepTimeIdx !== -1) {
    const endIdx = content.indexOf('\n', prepTimeIdx)
    if (endIdx !== -1) {
      prepTime = content.slice(prepTimeIdx + prepTimeField.length + 1, endIdx)
    }
  }

  const cookTimeIdx = content.toLowerCase().indexOf(cookTimeField)

  let cookTime = ''

  if (cookTimeIdx !== -1) {
    const endIdx = content.indexOf('\n', cookTimeIdx)
    if (endIdx !== -1) {
      cookTime = content.slice(cookTimeIdx + cookTimeField.length + 1, endIdx)
    }
  }

  const instructionsIdx = content.toLowerCase().indexOf(instructionsField)

  let instructions = ''

  if (instructionsIdx !== -1) {
    const endIdx = content.indexOf('\n\n', instructionsIdx)
    if (endIdx !== -1) {
      instructions = content.slice(
        instructionsIdx + instructionsField.length + 1,
        endIdx
      )
    }
  }

  const ingredientsIdx = content.toLowerCase().indexOf(ingredientsField)

  let ingredients = ''

  if (ingredientsIdx !== -1 && instructionsIdx !== -1) {
    ingredients = content.slice(
      ingredientsIdx + ingredientsField.length + 1,
      instructionsIdx - 2
    )
  }

  return { name, description, prepTime, cookTime, instructions, ingredients }
}

function getTranslatedFields({ locale }: { locale?: string }) {
  let descriptionField = 'description:'
  if (locale && locale === 'es') {
    descriptionField = 'descripción:'
  }

  let ingredientsField = 'ingredients:'
  if (locale && locale === 'es') {
    ingredientsField = 'ingredientes:'
  }

  let instructionsField = 'instructions:'
  if (locale && locale === 'es') {
    instructionsField = 'instrucciones:'
  }

  let cookTimeField = 'cook time:'
  if (locale && locale === 'es') {
    cookTimeField = 'tiempo de cocción:'
  }

  let prepTimeField = 'preparation time:'
  if (locale && locale === 'es') {
    prepTimeField = 'tiempo de preparación:'
  }

  let nameField = 'name:'
  if (locale && locale === 'es') {
    nameField = 'nombre:'
  }

  return {
    descriptionField,
    ingredientsField,
    instructionsField,
    cookTimeField,
    prepTimeField,
    nameField
  }
}

function removeLeadingHyphens(str: string) {
  if (str && str[0] === '-') {
    return str.slice(2)
  }

  return str
}
