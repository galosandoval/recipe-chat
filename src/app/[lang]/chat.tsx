'use client'

import ChatWindow from '~/components/chat-window'
import { ScrollToBottomProvider } from '~/components/scroll-to-bottom'
import { SubmitMessageForm } from '~/components/submit-message-form'
import { RecipeChatProvider } from '~/hooks/use-recipe-chat'

export default function Chat() {
  return (
    <RecipeChatProvider>
      <div className='relative flex h-full w-full flex-1 flex-col'>
        <ScrollToBottomProvider>
          <div className='flex-1 pt-16'>
            <ChatWindow />
          </div>
        </ScrollToBottomProvider>
        <SubmitMessageForm />
      </div>
    </RecipeChatProvider>
  )
}
