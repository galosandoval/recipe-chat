'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { HistoryIcon } from 'lucide-react'
import { Button } from '~/components/button'
import { NavigationButton } from '~/components/navigation-button'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import { useTranslations } from '~/hooks/use-translations'
import {
  chatContextToScope,
  chatScopeToSearchParams
} from '~/schemas/chats-schema'
import { CHAT_HISTORY_PATH } from './nav-shell'
import { cn } from '~/lib/utils'

/**
 * Opens Chat History for whatever the user is looking at: the current section's
 * chats everywhere, except on `/chat` — the one screen that isn't a section, so
 * it links to the unscoped list of every context's chats.
 *
 * Rendered in the app header on phones and in the sidebar at `md+`; pass
 * `showLabel` for the sidebar's wider row.
 */
export function ChatHistoryButton({
  showLabel = false
}: {
  showLabel?: boolean
}) {
  const t = useTranslations()
  const { data: session } = useSession()
  const pathname = usePathname()
  const context = useChatDrawerStore((s) => s.context)

  if (!session) return null

  const params =
    pathname === '/chat'
      ? ''
      : chatScopeToSearchParams(chatContextToScope(context))
  const href = params ? `${CHAT_HISTORY_PATH}?${params}` : CHAT_HISTORY_PATH

  return (
    <NavigationButton
      href={href}
      as={Button}
      variant='ghost'
      size={showLabel ? 'default' : 'icon'}
      aria-label={t.chat.history.title}
      className={cn(showLabel && 'w-full justify-start gap-3')}
    >
      <HistoryIcon />
      {showLabel && <span>{t.chat.history.title}</span>}
    </NavigationButton>
  )
}
