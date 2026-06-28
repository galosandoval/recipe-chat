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

  // Seed the taste-profile and filters queries into the RSC cache so
  // <ChatWelcome>'s summary and filters sections render from hydrated data on
  // first paint instead of firing their own client requests and flashing
  // loading states in (staggered) after the page mounts.
  await Promise.all([
    api.tasteProfile.get.prefetch(),
    api.filters.getByUserId.prefetch({ userId: session.user.id })
  ])

  return (
    <HydrateClient>
      <Chat />
    </HydrateClient>
  )
}
