'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useChatStore } from '~/stores/chat-store'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import {
  generatedMessageSchema,
  type MessageWithRecipes
} from '~/schemas/chats-schema'
import { useChatAI } from '~/hooks/use-chat-ai'
import { useEffect, useRef } from 'react'
import { userMessageDTO } from '~/lib/user-message-dto'
import type { GeneratedRecipe } from '~/schemas/messages-schema'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { selectActiveFilters } from '~/hooks/use-filters-by-user-id'
import { useChatPanelStore } from '~/stores/chat-panel-store'
import { Button } from '~/components/button'
import { Input } from '~/components/ui/input'
import { BottomBar } from '~/components/bottom-bar'
import { toast } from '~/components/toast'
import { SendIcon, StopCircleIcon } from 'lucide-react'

function useRecipeChat() {
  const userId = useUserId()
  const { setInput, setStream } = useChatStore()
  const { onFinishMessage, createUserMessage } = useChatAI()
  const {
    object,
    stop: aiStop,
    submit: aiSubmit
  } = useObject({
    api: '/api/chat',
    schema: generatedMessageSchema,
    onError(error) {
      if (error?.stack) toast.error(error.stack)
      if (error) toast.error(error.message)
      setStream({ content: '', recipes: [] })
    },
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
    const context = useChatPanelStore.getState().context
    setInput('')
    aiSubmit({
      messages,
      filters: selectActiveFilters(filters ?? []).map((f) => f.name),
      userId: userId || undefined,
      context
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

const STREAM_TIMEOUT = 30000 // 30 seconds

export function GenerateMessageForm() {
  const { input, handleInputChange, messages, chatId, reset, stream } =
    useChatStore()
  const isStreaming = stream !== null
  const { handleAISubmit, stop: aiStop } = useRecipeChat()
  const t = useTranslations()
  const streamTimeout = useRef<NodeJS.Timeout | null>(null)
  const handleAISubmitRef = useRef(handleAISubmit)

  // Keep the ref up-to-date with the latest handler
  useEffect(() => {
    handleAISubmitRef.current = handleAISubmit
  })

  // Set up a stable triggerAISubmission wrapper in the store (once)
  useEffect(() => {
    useChatStore.setState({
      triggerAISubmission: (messages: MessageWithRecipes[]) =>
        handleAISubmitRef.current(messages)
    })
  }, [])

  const enhancedHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const userMessage = userMessageDTO(input, chatId)

    const messagesToSubmit: MessageWithRecipes[] = [...messages, userMessage]

    if (isStreaming) {
      aiStop()
      if (streamTimeout.current) {
        clearTimeout(streamTimeout.current)
        streamTimeout.current = null
      }
    } else if (input.trim()) {
      handleAISubmit(messagesToSubmit)
      streamTimeout.current = setTimeout(() => {
        reset()
        streamTimeout.current = null
      }, STREAM_TIMEOUT)
    }
  }

  useEffect(() => {
    return () => {
      if (streamTimeout.current) {
        clearTimeout(streamTimeout.current)
        streamTimeout.current = null
      }
    }
  }, [])

  // Clear timeout when stream finishes
  useEffect(() => {
    if (!isStreaming && streamTimeout.current) {
      clearTimeout(streamTimeout.current)
      streamTimeout.current = null
    }
  }, [isStreaming])

  const context = useChatPanelStore((s) => s.context)

  let placeholder = t.chat.chatFormPlaceholder
  if (messages.length > 0) {
    placeholder = t.chat.chatFormContinue
  } else if (context.page === 'recipe-detail') {
    placeholder = t.chat.replace('chatFormRecipeDetail', context.recipe.name)
  } else if (context.page === 'list') {
    placeholder = t.chat.chatFormList
  } else if (context.page === 'pantry') {
    placeholder = t.chat.chatFormPantry
  }

  return (
    <form onSubmit={enhancedHandleSubmit}>
      <BottomBar>
        <div className='flex w-full'>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder}
            className='bg-background/75 focus:bg-background w-full'
          />
        </div>

        <div>
          <Button
            type='submit'
            disabled={input.length < 5 && !isStreaming}
            variant={isStreaming ? 'destructive' : 'outline'}
          >
            {isStreaming ? <StopCircleIcon /> : <SendIcon />}
          </Button>
        </div>
      </BottomBar>
    </form>
  )
}
