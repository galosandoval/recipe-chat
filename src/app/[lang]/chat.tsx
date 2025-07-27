'use client'

import ChatWindow from '~/components/chat-window'
import { ScrollToBottomProvider } from '~/components/scroll-to-bottom'
import { SubmitMessageForm } from '~/components/submit-message-form'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { generatedMessageSchema } from '~/schemas/chats'
import { useChatAI } from '~/hooks/use-chat-ai'
import { chatStore } from '~/stores/chat'
import { useEffect } from 'react'

export default function Chat() {
  const { onFinishMessage, createUserMessage, handleAIResponse, loadMessages } =
    useChatAI()
  const { setInput, setIsSendingMessage, setStream } = chatStore()
  // AI Integration at component level
  const {
    object,
    isLoading: aiIsLoading,
    stop: aiStop,
    submit: aiSubmit
  } = useObject({
    api: '/api/chat',
    schema: generatedMessageSchema,
    onFinish(message) {
      // Handle the final message when streaming is complete
      handleAIResponse(message)
      setIsSendingMessage(false)
      setStream({ content: '', recipes: [] })
      onFinishMessage()
    }
  })

  // Handle streaming updates (just update the display)
  useEffect(() => {
    if (object && object.content) {
      setStream({
        content: object.content || '',
        recipes: (object.recipes || []).filter(Boolean) as any[]
      })
    }
  }, [object, setStream])

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Enhanced AI submit function
  const handleAISubmit = (input: string) => {
    // Create user message
    createUserMessage(input)

    // Clear input
    setInput('')

    // Set loading states
    setIsSendingMessage(true)

    // Submit to AI
    aiSubmit(input)
  }

  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <ScrollToBottomProvider>
        <div className='flex-1 pt-20'>
          <ChatWindow
            aiSubmit={handleAISubmit}
            aiStop={aiStop}
            aiIsLoading={aiIsLoading}
          />
        </div>
      </ScrollToBottomProvider>
      <SubmitMessageForm aiSubmit={handleAISubmit} aiStop={aiStop} />
    </div>
  )
}
