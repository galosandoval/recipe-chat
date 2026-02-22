import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { Chat } from './chat'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect('/recipes')
  }

  return <Chat />
}
