import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api } from '~/trpc/server'
import { chatScopeFromParams } from '~/schemas/chats-schema'
import { ChatHistory } from './chat-history'

/**
 * Chat History: every chat the user can reopen, newest first.
 *
 * The scope lives in the search params, so the route is refresh- and
 * link-safe: `?page=list`, `?page=recipe-detail&recipeId=…` show one section's
 * chats (what the header button links to from that section), and no params at
 * all — the `/chat` entry point — shows every context in one list.
 */
export default async function ChatHistoryPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; recipeId?: string }>
}) {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  const scope = chatScopeFromParams(await searchParams)

  // Fetched in this authenticated RSC and handed down as the query's initial
  // data (same reason as `app/recipes/page.tsx`): the client component would
  // otherwise refetch during the server-render pass with no session cookie.
  const chats = await api.chats.getChatHistory({ scope })

  return <ChatHistory scope={scope} initialChats={chats} />
}
