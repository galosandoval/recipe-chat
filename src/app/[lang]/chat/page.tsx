import { HydrateClient } from '~/trpc/server'
import { type Metadata } from 'next'
import Chat from './chat'

export const metadata: Metadata = {
  title: 'RecipeChat - Chat',
  description: 'RecipeChat'
}

export default async function ChatPage() {
  return (
    <HydrateClient>
      <main className='flex min-h-svh flex-col items-center justify-center overflow-y-auto'>
        <Chat />
      </main>
    </HydrateClient>
  )
}
