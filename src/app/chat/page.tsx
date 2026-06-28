import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { HydrateClient, api } from '~/trpc/server'
import { Chat } from '../chat'

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  // No profile redirect: first-run onboarding is an in-app overlay now. The
  // prefetch below seeds `tasteProfile.get` (which returns null for a brand-new
  // user), and TasteProfileDrawer auto-opens the quiz from that.
  // Seed the taste-profile query into the RSC cache so <ChatWelcome>'s summary
  // renders from hydrated data on first paint instead of firing its own client
  // request and flashing a loading state in after the page mounts.
  await api.tasteProfile.get.prefetch()

  return (
    <HydrateClient>
      <Chat />
    </HydrateClient>
  )
}
