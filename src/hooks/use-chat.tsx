import { type Chat, type Message } from '@prisma/client'
import { useChat as useAiChat, type Message as AiMessage } from 'ai/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useCallback, useEffect, useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '~/trpc/react'
import { z } from 'zod'
import { useTranslations } from '~/hooks/use-translations'
import { useSignUp } from '~/components/auth-modals'
import {
  errorToastOptions,
  infoToastOptions,
  loadingToastOptions,
  successToastOptions
} from '~/components/toast'
import { useFiltersByUser } from '~/components/recipe-filters'
import { CURRENT_CHAT_ID, useSessionChatId } from './use-session-chat-id'
// import { useFilters } from '~/components/recipe-filters'

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
  const t = useTranslations()

  const [sessionChatId, setSessionChatId] = useSessionChatId()
  console.log('sessionChatId use-chat', sessionChatId)
  const router = useRouter()
  const { status: authStatus } = useSession()
  const filters = useFiltersByUser()

  const isAuthenticated = authStatus === 'authenticated'
  const utils = api.useContext()

  const filtersData = filters.data

  const filterStrings: string[] = []

  if (filtersData) {
    filtersData.forEach((filter) => {
      if (filter.checked) filterStrings.push(filter.name)
    })
  }

  const { mutate: upsertChat } = api.chats.upsert.useMutation({
    async onSuccess(data) {
      if (data.chatId) {
        setSessionChatId(data.chatId)
      }
      setMessages(data.messages)
    }
  })

  const {
    messages,
    input,
    handleInputChange,
    stop,
    handleSubmit: submitMessages,
    isLoading: isSendingMessage,
    setMessages,
    append
  } = useAiChat({
    onFinish(message) {
      onFinishMessage(message)
    },
    body: {
      filters: filterStrings
    }
  })

  const handleSubmitMessage = () => {
    let chatId = sessionChatId ?? ''

    if (!isAuthenticated) {
      return
    }

    upsertChat({
      chatId,
      messages: messagesRef.current.map((message) => ({
        content: message.content,
        role: message.role
        // id: createId()
      }))
    })
  }

  const messagesRef = useRef<AiMessage[]>([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  function onFinishMessage(_: AiMessage) {
    if (!messagesRef.current?.length) {
      throw new Error('No messages')
    }

    handleSubmitMessage()
  }

  const enabled = isAuthenticated && !!sessionChatId && !messages.length

  const { status, fetchStatus, data } = api.chats.getMessagesById.useQuery(
    { chatId: sessionChatId ?? '' },
    {
      enabled
      // keepPreviousData: true
    }
  )

  useEffect(() => {
    if (status === 'success') {
      setMessages(data?.messages ?? [])
    }
  }, [status, data])

  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)

  const { mutate: createRecipe, status: createRecipeStatus } =
    api.recipes.create.useMutation({
      async onSuccess(newRecipe, { messageId }) {
        await utils.recipes.invalidate()
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

        toast.success(t.chatWindow.saveSuccess)
      },
      onError: (error) => {
        toast.error('Error: ' + error.message)
      }
    })

  const { mutateAsync: createChatAndRecipeAsync } =
    api.users.createChatAndRecipe.useMutation({
      onError: (error) => {
        toast.error('Error: ' + error.message)
      }
    })

  const handleGetChatsOnSuccess = useCallback(
    (
      data: (Chat & {
        messages: Message[]
      })[]
    ) => {
      if (
        typeof sessionStorage.getItem(CURRENT_CHAT_ID) !== 'string' &&
        data[0]?.id
      ) {
        setSessionChatId(data[0].id)
      }
    },
    [setSessionChatId]
  )

  const handleChangeChat = useCallback(
    (
      chat: Chat & {
        messages: Message[]
      }
    ) => {
      setSessionChatId(chat.id)
      setIsChatsModalOpen(false)
    },
    []
  )

  const handleFillMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    append({ content: e.currentTarget.innerText, role: 'user' })
  }

  const handleStartNewChat = useCallback(() => {
    stop()
    setMessages([])
    setSessionChatId('')
  }, [])

  const handleToggleChatsModal = useCallback(() => {
    setIsChatsModalOpen((state) => !state)
  }, [])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (isSendingMessage) {
        stop()
      } else {
        submitMessages(event, { options: { body: { filters: filterStrings } } })
      }
    },

    [isSendingMessage, stop, submitMessages, filterStrings]
  )

  const {
    errors: signUpErrors,
    isLoading: isSigningUp,
    isOpen: isSignUpModalOpen,
    handleClose: handleCloseSignUpModal,
    handleOpen: handleOpenSignUpModal,
    handleSubmit: handleSubmitCreds,
    onSubmit: onSubmitCreds,
    register: registerCreds
  } = useSignUp(onSignUpSuccess)

  async function onSignUpSuccess() {
    // TODO - this is a hack to get the selected recipe to save
    const lastMessage = messages.at(-1)

    if (!lastMessage) throw new Error('No last message')

    const recipe = transformContentToRecipe({
      content: lastMessage.content
    })

    const newRecipePromise = createChatAndRecipeAsync({
      recipe,
      messages
    })
    const user = await toast.promise(
      newRecipePromise,
      {
        loading: t.loading.loggingIn,
        success: () => t.toast.loginSuccess,
        error: () => t.error.somethingWentWrong
      },
      {
        loading: loadingToastOptions,
        success: { ...successToastOptions, duration: 3000 },
        error: errorToastOptions
      }
    )

    router.push(
      `recipes/${user.recipes[0].id}?name=${encodeURIComponent(
        user.recipes[0].name
      )}`
    )
  }

  const handleGoToRecipe = useCallback(
    async ({
      recipeId,
      recipeName
    }: {
      recipeId: string | null
      recipeName?: string
    }) => {
      if (recipeId && recipeName) {
        await router.push(
          `recipes/${recipeId}?name=${encodeURIComponent(recipeName)}`
        )
      }
    },
    []
  )

  const handleSaveRecipe = useCallback(
    ({ content, messageId }: { content: string; messageId?: string }) => {
      if (!content) return

      if (!isAuthenticated) {
        handleOpenSignUpModal()

        toast(t.toast.signUp, infoToastOptions)
        return
      }

      const recipe = transformContentToRecipe({
        content
      })

      createRecipe({
        ...recipe,
        messageId
      })
    },
    [isAuthenticated]
  )

  return {
    // filters,
    chatId: sessionChatId,
    fetchStatus,
    status,
    isChatsModalOpen,
    input,
    messages,
    isSendingMessage,
    isAuthenticated,
    createRecipeStatus,
    signUpErrors,
    isSignUpModalOpen,
    isSigningUp,

    handleGoToRecipe,
    handleSaveRecipe,
    handleCloseSignUpModal,
    handleSubmitCreds,
    onSubmitCreds,
    registerCreds,
    handleGetChatsOnSuccess,
    handleInputChange: useCallback(handleInputChange, []),
    handleToggleChatsModal,
    handleChangeChat,
    handleStartNewChat,
    handleFillMessage,
    handleSubmit
  }
}

export const errorMessage = 'Please try rephrasing your question.'

const sendMessageFormSchema = z.object({ message: z.string().min(6) })
export type ChatRecipeParams = z.infer<typeof sendMessageFormSchema>

export function transformContentToRecipe({ content }: { content: string }) {
  return JSON.parse(content) as {
    name: string
    description: string
    prepTime: string
    cookTime: string
    categories: string[]
    instructions: string[]
    ingredients: string[]
  }
}
