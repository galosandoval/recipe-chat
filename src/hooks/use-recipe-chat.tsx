import { createContext, useRef } from 'react'
import { useChat as useAiChat, type Message as AiMessage } from 'ai/react'
import { useChatId } from './use-session-chat-id'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { useFiltersByUser } from '~/components/recipe-filters'

const RecipeChatContext = createContext<Partial<ReturnType<typeof useAiChat>>>({
  input: '',
  messages: [],
  isLoading: false,
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
  const [sessionChatId, changeChatId] = useChatId()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  //   const utils = api.useContext()
  const filters = useFiltersByUser()
  const filtersData = filters.data

  const filterStrings: string[] = []

  if (filtersData) {
    filtersData.forEach((filter) => {
      if (filter.checked) filterStrings.push(filter.name)
    })
  }
  const messagesRef = useRef<AiMessage[]>([])

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
  function onFinishMessage(_: AiMessage) {
    if (!messagesRef.current?.length) {
      throw new Error('No messages')
    }

    handleSubmitMessage()
  }
  const {
    messages,
    input,
    handleInputChange,
    stop,
    handleSubmit,
    isLoading,
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

  useEffect(() => {
    if (status === 'success') {
      setMessages(data?.messages ?? [])
    }
  }, [status, data])

  return (
    <RecipeChatContext.Provider
      value={{
        input,
        messages,
        isLoading,
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
