'use client'

import { useEffect } from 'react'
import { PlusIcon } from 'lucide-react'
import { Interface } from '~/components/chat/interface'
import { BottomActiveFilters } from '~/components/chat/bottom-active-filters'
import { GenerateMessageForm } from '~/components/chat/generate-message-form'
import { useRegisterFab } from '~/components/fab-stack/use-register-fab'
import { useChatStore } from '~/components/chat/chat-store'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'

export function Chat() {
  useEffect(() => {
    useChatStore.getState().initializeFromStorage()
    // useChatDrawerStore's context is global and otherwise only set by
    // route-specific ChatFab instances (recipe-detail, lists). Without this,
    // arriving here after visiting one of those pages leaves this page
    // showing that page's stale context (e.g. a prior recipe's suggestions).
    useChatDrawerStore.getState().setContext({ page: 'recipes' })
  }, [])

  return (
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
