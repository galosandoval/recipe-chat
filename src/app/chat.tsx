'use client'

import { useEffect } from 'react'
import { Interface } from '~/components/chat/interface'
import { BottomActiveFilters } from '~/components/chat/bottom-active-filters'
import { GenerateMessageForm } from '~/components/chat/generate-message-form'
import { useChatStore } from '~/stores/chat-store'

export function Chat() {
  useEffect(() => {
    useChatStore.getState().initializeFromStorage()
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
    </div>
  )
}
