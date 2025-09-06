'use client'

import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'
import { PaperPlaneIcon, StopIcon } from '~/components/icons'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import {
  generatedMessageSchema,
  type MessageWithRecipes
} from '~/schemas/chats-schema'
import { useChatAI } from '~/hooks/use-chat-ai'
import { useEffect } from 'react'
import { userMessageDTO } from '~/lib/user-message-dto'
import type { GeneratedRecipe } from '~/schemas/messages-schema'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { selectActiveFilters } from '~/hooks/use-filters-by-user-id'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { BottomBar } from '~/components/bottom-bar'

function useRecipeChat() {
  const userId = useUserId()
  const { setInput, setStream } = chatStore()
  const { onFinishMessage, createUserMessage } = useChatAI()
  const {
    object,
    stop: aiStop,
    submit: aiSubmit
  } = useObject({
    api: '/api/chat',
    schema: generatedMessageSchema,
    onFinish: onFinishMessage
  })
  const utils = api.useUtils()

  // Enhanced AI submit function
  const handleAISubmit = (messages: MessageWithRecipes[]) => {
    const lastMessage = messages.at(-1)
    if (lastMessage) {
      createUserMessage(lastMessage)
    }
    const filters = utils.filters.getByUserId.getData({ userId })
    setInput('')
    aiSubmit({
      messages,
      filters: selectActiveFilters(filters ?? []).map((f) => f.name),
      userId: userId || undefined
    })
  }

  // Handle streaming updates (just update the display)
  useEffect(() => {
    if (object && object.content) {
      setStream({
        content: object.content ?? '',
        recipes: (object.recipes ?? []).filter(Boolean) as GeneratedRecipe[]
      })
    }
  }, [object, setStream])

  return {
    handleAISubmit,
    stop: aiStop
  }
}

export function SubmitMessageForm() {
  const {
    input,
    handleInputChange,
    messages,
    streamingStatus,
    setStreamingStatus
  } = chatStore()
  const isStreaming = streamingStatus !== 'idle'
  const chatId = chatStore((state) => state.chatId)
  const { handleAISubmit, stop: aiStop } = useRecipeChat()
  const t = useTranslations()

  // Set up the triggerAISubmission method in the store
  useEffect(() => {
    chatStore.setState({ triggerAISubmission: handleAISubmit })
  }, [])

  const enhancedHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const userMessage = userMessageDTO(input, chatId)

    const messagesToSubmit: MessageWithRecipes[] = [...messages, userMessage]

    if (isStreaming) {
      aiStop()
      setStreamingStatus('idle')
    } else if (input.trim()) {
      setStreamingStatus('streaming')
      handleAISubmit(messagesToSubmit)
    }
  }

  let placeholder = t.chatWindow.chatFormPlaceholder
  if (messages.length > 0) {
    placeholder = t.chatWindow.chatFormContinue
  }

  return (
    <form onSubmit={enhancedHandleSubmit}>
      <BottomBar>
        <div className='flex w-full'>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder}
            className='bg-background/75 focus:bg-background relative w-full'
          />
        </div>

        <div>
          <Button
            type='submit'
            disabled={input.length < 5 && !isStreaming}
            variant={isStreaming ? 'destructive' : 'outline'}
          >
            {isStreaming ? <StopIcon /> : <PaperPlaneIcon />}
          </Button>
        </div>
      </BottomBar>
    </form>
  )
}
