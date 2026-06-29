import React from 'react'
import { HydrateClient, api } from '~/trpc/server'
import { PantryByUserId } from './pantry-by-user-id'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { ChatFab, ChatPanel } from '~/components/chat-panel'

export default async function PantryView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/recipes')
  }

  await api.pantry.byUserId.prefetch({ userId: session.user.id })

  return (
    <HydrateClient>
      <div className='mx-auto flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-3'>
        <PantryByUserId />
      </div>
      <ChatFab context={{ page: 'pantry' }} className='bottom-36' />
      <ChatPanel />
    </HydrateClient>
  )
}
