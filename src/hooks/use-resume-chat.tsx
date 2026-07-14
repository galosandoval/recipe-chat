import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { useChatStore } from '~/components/chat/chat-store'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import type { ChatContext } from '~/schemas/chats-schema'

/**
 * Resolves the "current chat" for a Chat Context from the server on entry.
 *
 * Asks the server for the context's most-recent chat and, if it's within the
 * freshness window, adopts it as the active `chatId`; otherwise the user starts
 * fresh (`chatId` cleared). Also mount-syncs the global chats-drawer filter to
 * this page's context so the settings-menu history shows the right scope
 * everywhere, not just on `/chat`.
 */
export function useResumeChat(context: ChatContext) {
  const setChatId = useChatStore((s) => s.setChatId)
  const setContext = useChatDrawerStore((s) => s.setContext)
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const { data } = api.chats.getResumableChat.useQuery(
    { context },
    {
      enabled: isAuthenticated,
      staleTime: Infinity,
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    setContext(context)
  }, [context, setContext])

  useEffect(() => {
    setChatId(data?.id ?? '')
  }, [data, setChatId])
}
