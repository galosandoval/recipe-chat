import { Button } from './button'
import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat'
import { PaperPlaneIcon, StopIcon } from './icons'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { generatedMessageSchema } from '~/schemas/chats'
import { useChatAI } from '~/hooks/use-chat-ai'
import { useEffect } from 'react'

export function SubmitMessageForm() {
  const {
    input,
    handleInputChange,
    isStreaming,
    setInput,
    setStream,
    setIsStreaming
  } = chatStore()
  const t = useTranslations()
  const { onFinishMessage, createUserMessage, handleAIResponse } = useChatAI()

  // AI Integration moved here to avoid re-rendering ChatWindow
  const {
    object,
    stop: aiStop,
    submit: aiSubmit
  } = useObject({
    api: '/api/chat',
    schema: generatedMessageSchema,
    onFinish(message) {
      // Handle the final message when streaming is complete
      handleAIResponse(message)
      setIsStreaming(false)
      setStream({ content: '', recipes: [] })
      onFinishMessage()
    }
  })

  // Handle streaming updates (just update the display)
  useEffect(() => {
    if (object && (object as any).content) {
      setStream({
        content: (object as any).content || '',
        recipes: ((object as any).recipes || []).filter(Boolean) as any[]
      })
    }
  }, [object, setStream])

  // Enhanced AI submit function
  const handleAISubmit = (input: string) => {
    // Create user message
    createUserMessage(input)

    // Clear input
    setInput('')

    // Set loading states
    setIsStreaming(true)

    // Submit to AI
    aiSubmit(input)
  }

  // Set up the triggerAISubmission method in the store
  useEffect(() => {
    chatStore.setState({ triggerAISubmission: handleAISubmit })
  }, [])

  const enhancedHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isStreaming) {
      aiStop()
    } else if (input.trim()) {
      handleAISubmit(input)
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
