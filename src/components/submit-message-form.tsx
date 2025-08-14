import { Button } from './button'
import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'
import { PaperPlaneIcon, StopIcon } from './icons'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import {
  generatedMessageSchema,
  type MessageWithRecipes
} from '~/schemas/chats'
import { useChatAI } from '~/hooks/use-chat-ai'
import { useEffect } from 'react'
import { userMessageDTO } from '~/utils/user-message-dto'
import { useFiltersByUser } from './recipe-filters'
import type { GeneratedRecipe } from '~/schemas/messages'

export function SubmitMessageForm() {
  const {
    input,
    handleInputChange,
    messages,
    streamingStatus,
    setInput,
    setStream,
    setStreamingStatus
  } = chatStore()
  const isStreaming = streamingStatus !== 'idle'
  const chatId = chatStore((state) => state.chatId)
  const t = useTranslations()
  const { onFinishMessage, createUserMessage } = useChatAI()
  const { data: filters, status } = useFiltersByUser()
  const {
    object,
    stop: aiStop,
    submit: aiSubmit
  } = useObject({
    api: '/api/chat',
    schema: generatedMessageSchema,
    onFinish: onFinishMessage
  })

  // Handle streaming updates (just update the display)
  useEffect(() => {
    if (object && object.content) {
      setStream({
        content: object.content ?? '',
        recipes: (object.recipes ?? []).filter(Boolean) as GeneratedRecipe[]
      })
    }
  }, [object, setStream])

  // Enhanced AI submit function
  const handleAISubmit = (messages: MessageWithRecipes[]) => {
    const lastMessage = messages.at(-1)
    if (lastMessage) {
      createUserMessage(lastMessage)
    }
    setInput('')
    // setStreamingStatus('streaming')
    aiSubmit({
      messages,
      filters: filters?.filter((f) => f.checked).map((f) => f.name) ?? []
    })
  }

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
            disabled={
              (input.length < 5 && !isStreaming) || status === 'pending'
            }
            className={`btn ${isStreaming ? 'btn-error' : 'btn-accent'}`}
          >
            {isStreaming ? <StopIcon /> : <PaperPlaneIcon />}
          </Button>
        </div>
      </div>
    </form>
  )
}
