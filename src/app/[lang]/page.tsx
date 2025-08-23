import { HydrateClient } from '~/trpc/server'
import Chat from './chat'
import { type Metadata } from 'next'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'RecipeChat - Chat',
  description: 'RecipeChat'
}

export default async function Home() {
  const session = await auth()
  if (session) {
    redirect('/chat')
  }

  return (
    <HydrateClient>
      <main className='flex min-h-svh flex-col items-center justify-center overflow-y-auto'>
        <Chat />
      </main>
    </HydrateClient>
  )
}
