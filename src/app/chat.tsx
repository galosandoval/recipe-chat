'use client'

import { useEffect } from 'react'
import { PlusIcon } from 'lucide-react'
import { Interface } from '~/components/chat/interface'
import { BottomActiveFilters } from '~/components/chat/bottom-active-filters'
import { GenerateMessageForm } from '~/components/chat/generate-message-form'
import { FloatingActionButton } from '~/components/floating-action-button'
import { useChatStore } from '~/stores/chat-store'
import { useChatDrawerStore } from '~/stores/chat-drawer-store'
import { usePathname } from 'next/navigation'
import { cn } from '~/lib/utils'

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
  const pathname = usePathname()

  if (isNewChat) return null
  const isHomePath = pathname === '/'

  const handleStartNewChat = () => {
    const { setChatId, setIsStreaming, setMessages } = useChatStore.getState()
    setChatId('')
    setIsStreaming(false)
    setMessages([])
  }

  return (
    <FloatingActionButton
      onClick={handleStartNewChat}
      className={cn('bottom-36', isHomePath && 'bottom-20')}
    >
      <PlusIcon />
    </FloatingActionButton>
  )
}
