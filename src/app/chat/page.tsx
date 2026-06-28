import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { prisma } from '~/server/db'
import { HydrateClient, api } from '~/trpc/server'
import { Chat } from '../chat'

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  const tasteProfile = await prisma.tasteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  })
  if (!tasteProfile) {
    redirect('/onboarding')
  }

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
