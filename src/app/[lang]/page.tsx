import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { ChatPanel } from '~/components/chat-panel'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect('/recipes')
  }

  return <ChatPanel />
}
