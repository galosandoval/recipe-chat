'use client'

import { PlusIcon } from 'lucide-react'
import { Interface } from '~/components/chat/interface'
import { BottomActiveFilters } from '~/components/chat/bottom-active-filters'
import { GenerateMessageForm } from '~/components/chat/generate-message-form'
import { ChatSessionProvider } from '~/components/chat/use-chat-session'
import { useRegisterFab } from '~/components/fab-stack/use-register-fab'
import { useChatStore } from '~/components/chat/chat-store'
import { useResumeChat, type ResumeChatSeed } from '~/hooks/use-resume-chat'
import { RECIPES_CONTEXT } from '~/schemas/chats-schema'

export function Chat({ seed }: { seed?: ResumeChatSeed }) {
  // Resolve the general `/chat` context's resumable chat from the server and
  // keep the chats-drawer filter synced to it.
  useResumeChat(RECIPES_CONTEXT, seed)

  return (
    <ChatSessionProvider>
      <div className='flex min-h-0 flex-1 flex-col'>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <Interface />
        </div>
        <div className='sticky bottom-0 z-20 shrink-0'>
          <BottomActiveFilters />
          <GenerateMessageForm />
        </div>
        <NewChatFab />
      </div>
    </ChatSessionProvider>
  )
}

function NewChatFab() {
  const chatId = useChatStore((s) => s.chatId)
  const messages = useChatStore((s) => s.messages)
  const isNewChat = !chatId && messages.length === 0

  // The existing `isNewChat` guard is unchanged: on a fresh chat this component
  // unmounts its inner FAB, which unregisters it from the stack. No other file
  // needs a matching edit for the survivors to reflow.
  if (isNewChat) return null

  return <RegisteredNewChatFab />
}

function RegisteredNewChatFab() {
  // No aria-label: the pre-migration FAB had none, and this feature deliberately
  // keeps each migrated FAB's accessible name unchanged.
  useRegisterFab({
    id: 'new-chat',
    priority: 0,
    icon: <PlusIcon />,
    onClick: () => {
      const { setChatId, setIsStreaming, setMessages } = useChatStore.getState()
      setChatId('')
      setIsStreaming(false)
      setMessages([])
    }
  })

  return null
}
