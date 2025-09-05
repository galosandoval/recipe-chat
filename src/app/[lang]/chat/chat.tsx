'use client'

import { Interface } from './interface'
import { SubmitMessageForm } from './submit-message-form'
import { useActiveFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'

export default function Chat() {
  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <Interface />
      <BottomActiveFilters />
      <SubmitMessageForm />
    </div>
  )
}

function BottomActiveFilters() {
  const { data: activeFilters, status } = useActiveFiltersByUserId()
  const t = useTranslations()
  const messages = chatStore((state) => state.messages)

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }

  if (
    activeFilters?.length === 0 ||
    messages.length === 0 ||
    status === 'pending'
  ) {
    return null
  }

  return (
    <div className='fixed right-0 bottom-14 left-0 z-10 sm:bottom-[4.5rem]'>
      <div className='glass-element mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto px-3 py-1 sm:rounded'>
        <h3 className='text-glass mt-0 mb-0 text-xs font-semibold'>
          {t.filters.title}:
        </h3>
        {activeFilters?.map((f) => (
          <div
            className='bg-secondary text-foreground rounded p-2 py-1 text-xs whitespace-nowrap'
            key={f.id}
          >
            {f.name}
          </div>
        ))}
      </div>
    </div>
  )
}
