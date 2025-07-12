import { HydrateClient } from '~/trpc/server'
import Chat from './chat'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RecipeChat - Chat',
  description: 'RecipeChat'
}

export default function Home() {
  return (
    <HydrateClient>
      <main className='flex min-h-svh flex-col items-center justify-center'>
        <Chat />
      </main>
    </HydrateClient>
  )
}
