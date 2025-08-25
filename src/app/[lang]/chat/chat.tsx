'use client'

import { ScrollToBottomProvider } from '~/components/scroll-to-bottom'
import { ChatWindow } from './chat-window'
import { SubmitMessageForm } from './submit-message-form'
import { useFiltersByUser } from '~/hooks/use-filters-by-user-id'
import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'

export default function Chat() {
  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <ScrollToBottomProvider>
        <div className='flex-1 pt-20'>
          <ChatWindow />
        </div>
      </ScrollToBottomProvider>
      <ActiveFilters />
      <SubmitMessageForm />
    </div>
  )
}

function ActiveFilters() {
  const { data: filters, status } = useFiltersByUser()
  const t = useTranslations()
  const messages = chatStore((state) => state.messages)

  if (status === 'error' || !filters) {
    return <div>{t.error.somethingWentWrong}</div>
  }
  const activeFilters = filters.filter((f) => f.checked)

  if (
    activeFilters.length === 0 ||
    messages.length === 0 ||
    status === 'pending'
  ) {
    return null
  }

  return (
    <div className='fixed right-0 bottom-16 left-0 z-10'>
      <div className='flex items-center gap-2 overflow-x-auto px-4'>
        <h3 className='mt-0 mb-0 text-xs font-semibold'>{t.filters.title}:</h3>
        {activeFilters.map((f) => (
          <div
            className='bg-base-300 rounded p-2 py-1 text-xs whitespace-nowrap'
            key={f.id}
          >
            {f.name}
          </div>
        ))}
      </div>
    </div>
  )
}
