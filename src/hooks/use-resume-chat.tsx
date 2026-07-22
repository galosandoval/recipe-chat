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
  const clearMessages = useChatStore((s) => s.clearMessages)
  const setContext = useChatDrawerStore((s) => s.setContext)
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const recipeId = context.page === 'recipe-detail' ? context.recipe.id : null

  const { data, isSuccess } = api.chats.getResumableChat.useQuery(
    { context },
    {
      enabled: isAuthenticated,
      staleTime: Infinity,
      refetchOnWindowFocus: false
    }
  )

  // Keep the global chats-drawer filter synced to this page's context.
  useEffect(() => {
    setContext(context)
  }, [context, setContext])

  // On entering/switching context, start from a clean slate so a prior
  // context's conversation never bleeds in. Keyed on the scope (page +
  // recipeId), not the context object or chatId, so a same-context re-render
  // (e.g. the recipe refetching after an edit) never wipes an active chat.
  useEffect(() => {
    setChatId('')
    clearMessages()
  }, [context.page, recipeId, setChatId, clearMessages])

  // Adopt the context's resumable chat once resolved; a blank result stays a
  // fresh chat (messages already cleared above).
  useEffect(() => {
    if (!isSuccess) return
    setChatId(data?.id ?? '')
  }, [isSuccess, data, setChatId])
}
