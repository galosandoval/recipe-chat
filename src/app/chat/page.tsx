import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { prisma } from '~/server/db'
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

  return <Chat />
}
