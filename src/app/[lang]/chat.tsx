'use client'

import ChatWindow from '~/components/chat-window'
import { ScrollToBottomProvider } from '~/components/scroll-to-bottom'
import { SubmitMessageForm } from '~/components/submit-message-form'
import { useChat } from '~/hooks/use-chat'

export default function Chat() {
  const {
    input,
    isSendingMessage,

    handleInputChange,
    handleSubmit,
    ...rest
  } = useChat()

  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <ScrollToBottomProvider>
        <div className='flex-1 pt-16'>
          <ChatWindow isSendingMessage={isSendingMessage} {...rest} />
        </div>
      </ScrollToBottomProvider>
      <SubmitMessageForm
        input={input}
        isSendingMessage={isSendingMessage}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
      />
    </div>
  )
}
