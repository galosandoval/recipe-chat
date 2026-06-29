import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { Chat } from './chat'

export default async function Home() {
  const session = await auth()
  // First-run onboarding is now an in-app overlay (auto-opened by
  // TasteProfileDrawer), so authed users go straight to chat regardless of
  // whether they've completed their taste profile yet.
  if (session?.user) {
    redirect('/chat')
  }

  return <Chat />
}
