import { useSession } from 'next-auth/react'
import { useSessionChatId } from './use-session-chat-id'
import { useFiltersByUser } from '~/components/recipe-filters'
import { api } from '~/trpc/react'
import { chatStore } from '~/stores/chat'
import { createId } from '@paralleldrive/cuid2'
import type { Message } from '@prisma/client'
import { useCallback } from 'react'
import type { generatedMessageSchema } from '~/schemas/chats'
import { Experimental_UseObjectHelpers as UseObjectHelpers } from '@ai-sdk/react'

type Object = UseObjectHelpers<typeof generatedMessageSchema, string>['object']
type Error = UseObjectHelpers<typeof generatedMessageSchema, string>['error']
type OnFinish = { object: Object; error: Error }

export const useChatAI = () => {
  const [sessionChatId, changeChatId] = useSessionChatId()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const filters = useFiltersByUser()
  const filtersData = filters.data

  const { messages, addMessage, setMessages } = chatStore()

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

  const handleUpsertMessage = useCallback(() => {
    let chatId = sessionChatId ?? ''

    if (!isAuthenticated) {
      return
    }

    upsertChat({
      chatId,
      messages: messages.map((message) => ({
        content: message.content,
        role: message.role
      }))
    })
  }, [sessionChatId, isAuthenticated, messages, upsertChat])

  const onFinishMessage = useCallback(() => {
    if (!messages?.length) {
      throw new Error('No messages')
    }
    handleUpsertMessage()
  }, [messages?.length, handleUpsertMessage])

  const enabled = isAuthenticated && !!sessionChatId

  const { status: queryStatus, data } = api.chats.getMessagesById.useQuery(
    { chatId: sessionChatId ?? '' },
    {
      enabled,
      staleTime: Infinity
    }
  )

  // Load messages when query succeeds
  const loadMessages = useCallback(() => {
    if (queryStatus === 'success' && data?.messages) {
      setMessages(data.messages)
    }
  }, [queryStatus, data?.messages])

  // Create user message and add to store
  const createUserMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: createId(),
        content,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        chatId: sessionChatId ?? ''
      }

      addMessage(userMessage)
      return userMessage
    },
    [sessionChatId, addMessage]
  )

  // Handle AI response completion
  const handleAIResponse = useCallback(
    (aiResponse: OnFinish) => {
      if (aiResponse?.object?.content) {
        const assistantMessage: Message = {
          id: createId(),
          content: aiResponse.object.content,
          role: 'assistant',
          createdAt: new Date(),
          updatedAt: new Date(),
          chatId: sessionChatId ?? ''
        }

        addMessage(assistantMessage)
      }
    },
    [sessionChatId, addMessage, createId]
  )

  return {
    // Actions
    createUserMessage,
    handleAIResponse,
    onFinishMessage,
    loadMessages
  }
}
