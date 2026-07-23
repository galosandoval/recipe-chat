import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { HydrateClient, api } from '~/trpc/server'
import { RECIPES_CONTEXT } from '~/schemas/chats-schema'
import { Chat } from '../chat'

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  // No profile redirect: first-run onboarding is an in-app overlay now. The
  // taste-profile prefetch seeds `tasteProfile.get` (which returns null for a
  // brand-new user), and TasteProfileDrawer auto-opens the quiz from that.
  // Seed the taste-profile, filters, and pantry queries into the RSC cache so
  // <ChatWelcome>'s summary, filters, and pantry-toggle sections render from
  // hydrated data on first paint instead of firing their own client requests
  // and flashing loading states in (staggered) after the page mounts.
  const [, , , resumable] = await Promise.all([
    api.tasteProfile.get.prefetch(),
    api.filters.getByUserId.prefetch({ userId: session.user.id }),
    api.pantry.byUserId.prefetch({ userId: session.user.id }),
    api.chats.getResumableChat({ context: RECIPES_CONTEXT })
  ])

  // Resolve the resumable chat's messages too, so `useResumeChat` can seed
  // both queries before the client tree renders — otherwise `chatId` and
  // `messages` land in the store on different renders, racing whatever chat
  // surface (e.g. a recipe-detail chat) was mounted before this navigation
  // and leaving the page stuck on its loading state.
  const messages = resumable
    ? await api.chats.getMessagesById({ chatId: resumable.id })
    : null

  return (
    <HydrateClient>
      <Chat seed={{ resumable, messages }} />
    </HydrateClient>
  )
}
