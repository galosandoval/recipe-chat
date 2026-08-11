import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api } from '~/trpc/server'
import { RECIPES_CONTEXT } from '~/schemas/chats-schema'
import { Chat } from '../chat'
import { ChatInitialDataProvider } from './chat-initial-data'

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  // No profile redirect: first-run onboarding is an in-app overlay now. The
  // taste profile (null for a brand-new user) is what TasteProfileDrawer opens
  // the quiz from.
  //
  // Fetch in this authenticated RSC and seed the client cache during render
  // (see ChatInitialDataProvider) so <ChatWelcome>'s summary, filters and
  // pantry-toggle sections render from real data on first paint instead of
  // firing their own client requests and flashing loading states in
  // (staggered) after the page mounts.
  //
  // The chat + its messages resolve together so `useResumeChat` can seed both
  // queries before the client tree renders — otherwise `chatId` and `messages`
  // land in the store on different renders, racing whatever chat surface (e.g.
  // a recipe-detail chat) was mounted before this navigation and leaving the
  // page stuck on its loading state.
  const [tasteProfile, filters, pantry, seed] = await Promise.all([
    api.tasteProfile.get(),
    api.filters.getByUserId({ userId: session.user.id }),
    api.pantry.byUserId({ userId: session.user.id }),
    api.chats.getResumableChatWithMessages({ context: RECIPES_CONTEXT })
  ])

  return (
    <ChatInitialDataProvider
      userId={session.user.id}
      data={{ tasteProfile, filters, pantry }}
    >
      <Chat seed={seed} />
    </ChatInitialDataProvider>
  )
}
