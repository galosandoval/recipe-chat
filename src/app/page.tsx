import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { prisma } from '~/server/db'
import { Chat } from './chat'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    const tasteProfile = await prisma.tasteProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })
    if (!tasteProfile) {
      redirect('/onboarding')
    }
    redirect('/chat')
  }

  return <Chat />
}
