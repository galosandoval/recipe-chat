import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api, type RouterOutputs } from '~/trpc/react'
import { useChatStore } from '~/components/chat/chat-store'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import type { ChatContext } from '~/schemas/chats-schema'

/**
 * Server-resolved resume state for a Chat Context, fetched during the page's
 * RSC render (see `app/chat/page.tsx`, `app/recipes/page.tsx`,
 * `app/recipes/[slug]/page.tsx`) and handed down so {@link useResumeChat} can
 * seed the client query cache before first paint instead of racing a
 * client-side fetch.
 */
export type ResumeChatSeed = {
  resumable: RouterOutputs['chats']['getResumableChat']
  messages: RouterOutputs['chats']['getMessagesById'] | null
}

/**
 * Resolves the "current chat" for a Chat Context from the server on entry.
 *
 * Asks the server for the context's most-recent chat and, if it's within the
 * freshness window, adopts it as the active `chatId`; otherwise the user starts
 * fresh (`chatId` cleared). Also mount-syncs the global chats-drawer filter to
 * this page's context so the settings-menu history shows the right scope
 * everywhere, not just on `/chat`.
 *
 * @param seed - Resume state the owning page already resolved server-side.
 * Seeding the query cache with it before first render (rather than letting
 * the query below fetch client-side) is what makes the adopt effect resolve
 * synchronously instead of racing whatever chat surface was mounted before
 * this one.
 */
export function useResumeChat(context: ChatContext, seed?: ResumeChatSeed) {
  const setChatId = useChatStore((s) => s.setChatId)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const setContext = useChatDrawerStore((s) => s.setContext)
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const recipeId = context.page === 'recipe-detail' ? context.recipe.id : null

  const utils = api.useUtils()
  // Seed during render, before children mount (mirrors
  // RecipeInitialDataProvider in src/hooks/use-recipe.tsx) so the queries
  // below are a synchronous cache hit on the very first render.
  useState(() => {
    if (!seed) return
    utils.chats.getResumableChat.setData({ context }, seed.resumable)
    if (seed.resumable && seed.messages) {
      utils.chats.getMessagesById.setData(
        { chatId: seed.resumable.id },
        seed.messages
      )
    }
  })

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
  // fresh chat (messages already cleared above). A chat the user opened from
  // Chat History wins over auto-resume for as long as this page stays in that
  // chat's scope: the ref remembers which chat was adopted (not merely *that*
  // one was), so every later run of this effect re-applies it instead of
  // falling back to the context's most recent chat. Remembering the id is what
  // makes the adoption survive a second effect pass — React's dev-only double
  // invoke re-runs the clear effect above, which blanks `chatId` again.
  const adopted = useRef<{ scopeKey: string; chatId: string } | null>(null)
  const scopeKey = `${context.page}:${recipeId ?? ''}`

  useEffect(() => {
    if (!isSuccess) return

    const { pendingChat, setPendingChat } = useChatStore.getState()
    const isPendingHere =
      pendingChat?.scope.page === context.page &&
      pendingChat?.scope.recipeId === recipeId

    if (pendingChat && isPendingHere) {
      adopted.current = { scopeKey, chatId: pendingChat.chatId }
      setPendingChat(null)
    }

    // A chat adopted under a different scope is stale — switching context is
    // exactly when auto-resume should take over again.
    if (adopted.current?.scopeKey === scopeKey) {
      setChatId(adopted.current.chatId)
      return
    }

    setChatId(data?.id ?? '')
  }, [isSuccess, data, context.page, recipeId, scopeKey, setChatId])
}
