'use client'

import ChatWindow from '~/components/chat-window'
import { ScrollToBottomProvider } from '~/components/scroll-to-bottom'
import { SubmitMessageForm } from '~/components/submit-message-form'

export default function Chat() {
  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <ScrollToBottomProvider>
        <div className='flex-1 pt-20'>
          <ChatWindow />
        </div>
      </ScrollToBottomProvider>
      <SubmitMessageForm />
    </div>
  )
}
