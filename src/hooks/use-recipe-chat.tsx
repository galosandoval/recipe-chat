import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ChangeEvent,
  type FormEvent
} from 'react'
import {
  useChat as useAiChat,
  type Message as AiMessage,
  type CreateMessage
} from 'ai/react'
import { useSessionChatId } from './use-session-chat-id'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { useFiltersByUser } from '~/components/recipe-filters'
import type { FetchStatus, QueryStatus } from '@tanstack/react-query'

type RecipeChatContextType = {
  input: string
  messages: AiMessage[]
  isSendingMessage: boolean
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  stop: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  setMessages: (messages: AiMessage[]) => void
  chatsFetchStatus: FetchStatus
  chatsQueryStatus: QueryStatus
  append: (message: CreateMessage) => Promise<string | null | undefined>
}

const RecipeChatContext = createContext<RecipeChatContextType>({
  input: '',
  messages: [],
  isSendingMessage: false,
  chatsFetchStatus: 'idle',
  chatsQueryStatus: 'pending',
  handleInputChange: () => {},
  stop: () => {},
  handleSubmit: () => {},
  setMessages: () => {},
  append: () => Promise.resolve(null)
})

export const RecipeChatProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [sessionChatId, changeChatId] = useSessionChatId()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const filters = useFiltersByUser()
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
        changeChatId(data.chatId)
      }
      setMessages(data.messages)
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

  const messagesRef = useRef<AiMessage[]>([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  function onFinishMessage(message: AiMessage) {
    if (!messagesRef.current?.length) {
      throw new Error('No messages')
    }
    console.log('message', message)
    handleSubmitMessage()
  }

  const enabled = isAuthenticated && !!sessionChatId && !messages.length

  const {
    status: chatsQueryStatus,
    fetchStatus: chatsFetchStatus,
    data
  } = api.chats.getMessagesById.useQuery(
    { chatId: sessionChatId ?? '' },
    {
      enabled
      // keepPreviousData: true
    }
  )

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
  useEffect(() => {
    if (chatsQueryStatus === 'success') {
      setMessages(data?.messages ?? [])
    }
  }, [chatsQueryStatus, data])

  return (
    <RecipeChatContext.Provider
      value={{
        input,
        messages,
        isSendingMessage,
        chatsFetchStatus,
        chatsQueryStatus,
        handleInputChange,
        stop,
        handleSubmit,
        setMessages,
        append
      }}
    >
      {children}
    </RecipeChatContext.Provider>
  )
}

export const useRecipeChat = () => {
  const context = useContext(RecipeChatContext)
  if (!context) {
    throw new Error('useRecipeChat must be used within a RecipeChatProvider')
  }
  return context
}
