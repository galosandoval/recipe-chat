'use client'

import { useEffect } from 'react'
import { Interface } from './interface'
import { GenerateMessageForm } from './generate-message-form'
import { BottomActiveFilters } from './bottom-active-filters'
import { chatStore } from '~/stores/chat-store'

export default function Chat() {
  // Initialize chatId from session storage after hydration
  useEffect(() => {
    chatStore.getState().initializeFromStorage()
  }, [])

  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <Interface />
      <BottomActiveFilters />
      <GenerateMessageForm />
    </div>
  )
}
