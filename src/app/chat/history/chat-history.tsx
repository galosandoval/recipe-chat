'use client'

import { api, type RouterOutputs } from '~/trpc/react'
import { useTranslations, useLocale } from '~/hooks/use-translations'
import { formatTimeAgo } from '~/lib/relative-time-format'
import { Badge } from '~/components/badge'
import { useAppRouter } from '~/hooks/use-app-router'
import { useChatStore } from '~/components/chat/chat-store'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import {
  chatScopeSchema,
  type ChatContext,
  type ChatScope
} from '~/schemas/chats-schema'

type ChatHistoryItem = RouterOutputs['chats']['getChatHistory'][number]

/**
 * The Chat History list. Each card reopens its chat on the surface that owns
 * the chat's Chat Context — see {@link useOpenChat}.
 *
 * @param scope - The section this list is filtered to, or `null` for the
 * every-context list, which is the only one that labels each card's section.
 */
export function ChatHistory({
  scope,
  initialChats
}: {
  scope: ChatScope | null
  initialChats: ChatHistoryItem[]
}) {
  const t = useTranslations()
  const openChat = useOpenChat()
  const { data: chats } = api.chats.getChatHistory.useQuery(
    { scope },
    { initialData: initialChats }
  )

  if (chats.length === 0) {
    return (
      <p className='text-muted-foreground px-4 py-8 text-center text-sm'>
        {t.chat.history.empty}
      </p>
    )
  }

  return (
    <ul className='flex flex-col gap-2 px-3 py-3'>
      {chats.map((chat) => (
        <li key={chat.id}>
          <ChatHistoryCard
            chat={chat}
            showSection={!scope}
            onClick={() => openChat(chat)}
          />
        </li>
      ))}
    </ul>
  )
}

function ChatHistoryCard({
  chat,
  showSection,
  onClick
}: {
  chat: ChatHistoryItem
  showSection: boolean
  onClick: () => void
}) {
  const t = useTranslations()
  const locale = useLocale()
  const title = chat.messages[0]?.content ?? t.chat.history.untitled
  const sectionLabel = useSectionLabel(chat)

  return (
    <button
      type='button'
      onClick={onClick}
      className='bg-card text-card-foreground hover:bg-accent active:bg-accent flex w-full flex-col gap-2 rounded-md border p-3 text-left shadow transition-colors'
    >
      <p className='line-clamp-2 text-sm font-medium'>{title}</p>

      <div className='flex w-full items-center gap-2'>
        {showSection && (
          // A recipe name can be far longer than the card is wide; it truncates
          // rather than pushing the timestamp off the card.
          <Badge
            variant='secondary'
            label={sectionLabel}
            className='min-w-0'
            labelClassName='truncate text-xs'
          />
        )}
        <span className='text-primary ml-auto shrink-0 text-xs'>
          {formatTimeAgo(chat.updatedAt, locale)}
        </span>
      </div>
    </button>
  )
}

/**
 * The section a chat belongs to, as the every-context list labels it.
 *
 * The `recipes` context is the general assistant — both `/chat` and the Recipes
 * list's "add with chat" open it — so it reads as Chat here. `recipes` is the
 * stored Chat Context discriminant, not a label; the two need not match.
 */
function useSectionLabel(chat: ChatHistoryItem) {
  const t = useTranslations()

  switch (chatPage(chat)) {
    case 'recipe-detail':
      return chat.recipe?.name ?? t.nav.chat
    case 'list':
      return t.nav.list
    case 'pantry':
      return t.nav.pantry
    default:
      return t.nav.chat
  }
}

/**
 * Reopens a chat on the surface that owns its Chat Context: the `/chat` page
 * for general chats, the chat panel over the section's own page for the rest.
 * The chat itself travels through the store as a pending chat — `useResumeChat`
 * adopts it once that page has settled into the matching context, in place of
 * the auto-resume chat it would otherwise pick.
 */
function useOpenChat() {
  const router = useAppRouter()
  const { setPendingChat } = useChatStore()
  const openChatPanel = useChatDrawerStore((s) => s.open)

  return (chat: ChatHistoryItem) => {
    const page = chatPage(chat)
    setPendingChat({
      chatId: chat.id,
      scope: { page, recipeId: chat.recipeId }
    })

    if (page === 'recipe-detail' && chat.recipe) {
      // No context passed: the recipe snapshot a `recipe-detail` context needs
      // is the recipe page's to build (see `recipe-detail-chat.tsx`), and it
      // sets it on mount — this only asks for the panel to already be open.
      openChatPanel()
      router.push(`/recipes/${chat.recipe.slug}`)
      return
    }

    if (page === 'list' || page === 'pantry') {
      openChatPanel({ page })
      router.push(`/lists?tab=${page}`)
      return
    }

    router.push('/chat')
  }
}

/** Narrows a chat's persisted `page` column back to a Chat Context page. */
function chatPage(chat: ChatHistoryItem): ChatContext['page'] {
  const parsed = chatScopeSchema.shape.page.safeParse(chat.page)
  return parsed.success ? parsed.data : 'recipes'
}
