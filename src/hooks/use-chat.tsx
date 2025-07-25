import { type Chat, type Message } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useCallback, useState, useContext } from 'react'
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
import { ScrollModeContext } from '~/components/scroll-to-bottom'
import { useRecipeChat } from './use-recipe-chat'

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

  const [sessionChatId, changeChatId] = useSessionChatId()
  const router = useRouter()
  const { status: authStatus } = useSession()
  const filters = useFiltersByUser()
  const { setScrollMode } = useContext(ScrollModeContext)

  const isAuthenticated = authStatus === 'authenticated'
  const utils = api.useContext()

  const filtersData = filters.data

  const filterStrings: string[] = []

  if (filtersData) {
    filtersData.forEach((filter) => {
      if (filter.checked) filterStrings.push(filter.name)
    })
  }

  const { setMessages, append, stop, messages } = useRecipeChat()

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
        changeChatId(data[0].id)
      }
    },
    [changeChatId]
  )

  const handleChangeChat = useCallback(
    (
      chat: Chat & {
        messages: Message[]
      }
    ) => {
      changeChatId(chat.id)
      setIsChatsModalOpen(false)
    },
    []
  )

  const handleFillMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    append({ content: e.currentTarget.innerText, role: 'user' })
  }

  const handleToggleChatsModal = useCallback(() => {
    setIsChatsModalOpen((state) => !state)
  }, [])

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
    isChatsModalOpen,
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
    handleToggleChatsModal,
    handleChangeChat,
    handleFillMessage
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
