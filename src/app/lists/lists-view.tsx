'use client'

import { type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { ListTodoIcon, PackageIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'
import { ChatFab } from '~/components/chat-panel'
import { ListByUserId } from '~/app/list/list-by-user-id'
import { PantryByUserId } from '~/app/pantry/pantry-by-user-id'
import { useResumeChat } from '~/hooks/use-resume-chat'
import type { ChatContext } from '~/schemas/chats-schema'

type ListsTab = 'list' | 'pantry'

function parseTab(value: string | null): ListsTab {
  return value === 'pantry' ? 'pantry' : 'list'
}

/**
 * Tab container that co-locates the grocery list and pantry under `/lists`.
 * The `?tab=` search param is the only source of truth (refresh/link safe, and
 * back/forward moves between tabs); switching never leaves the route. The
 * footer ({@link AppFooter}) and chat assistant context both follow this tab.
 */
export function ListsView() {
  const searchParams = useSearchParams()
  const t = useTranslations()
  const activeTab = parseTab(searchParams.get('tab'))

  const handleTabChange = (tab: ListsTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    // Native history API rather than `router.push`: Next syncs `useSearchParams`
    // synchronously, so the footer input swaps in the same frame as the tab
    // instead of lagging behind an RSC round trip.
    window.history.pushState(null, '', `/lists?${params.toString()}`)
  }

  const context: ChatContext = { page: activeTab }
  useResumeChat(context)

  const tabs: { value: ListsTab; label: string; icon: ReactNode }[] = [
    { value: 'list', label: t.nav.list, icon: <ListTodoIcon /> },
    { value: 'pantry', label: t.nav.pantry, icon: <PackageIcon /> }
  ]

  return (
    <>
      <div className='mx-auto flex min-h-0 w-full flex-1 flex-col pt-4 pb-3'>
        <div
          role='tablist'
          aria-label={t.nav.lists}
          className='mx-2 mb-2 flex gap-2'
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type='button'
                role='tab'
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-75 active:scale-[99%] [&_svg]:size-4',
                  isActive
                    ? 'bg-accent text-accent-foreground/75 border-transparent'
                    : 'text-card-foreground/75 hover:bg-accent hover:text-accent-foreground/75 border-muted-foreground/20'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>
        {activeTab === 'list' ? <ListByUserId /> : <PantryByUserId />}
      </div>
      <ChatFab context={{ page: activeTab }} />
    </>
  )
}
