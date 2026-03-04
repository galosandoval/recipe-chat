import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { Chat } from '../chat'

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  return <Chat />
}
