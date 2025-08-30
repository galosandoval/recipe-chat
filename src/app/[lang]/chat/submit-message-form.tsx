'use client'

import { Button } from '~/components/button'
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
import { userMessageDTO } from '~/utils/user-message-dto'
import type { GeneratedRecipe } from '~/schemas/messages-schema'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { selectActiveFilters } from '~/hooks/use-filters-by-user-id'

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
      userId
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

  return (
    <form
      onSubmit={enhancedHandleSubmit}
      className={`fixed bottom-0 left-0 flex w-full items-center md:rounded-md`}
    >
      <div className='prose bg-base-300/75 mx-auto flex w-full items-center py-1 sm:mb-2 sm:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={t.chatFormPlaceholder}
            className='input input-bordered bg-base-100/75 focus:bg-base-100 relative w-full'
          />
        </div>

        <div className='pr-2'>
          <Button
            type='submit'
            disabled={input.length < 5 && !isStreaming}
            className={`btn ${isStreaming ? 'btn-error' : 'btn-accent'}`}
          >
            {isStreaming ? <StopIcon /> : <PaperPlaneIcon />}
          </Button>
        </div>
      </div>
    </form>
  )
}
