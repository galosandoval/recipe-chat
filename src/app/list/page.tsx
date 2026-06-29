import React from 'react'
import { HydrateClient, api } from '~/trpc/server'
import { ListByUserId } from './list-by-user-id'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { ChatFab, ChatPanel } from '~/components/chat-panel'

export default async function ListView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/recipes')
  }

  // Prefetch user's list data into React Query cache
  await api.lists.byUserId.prefetch({ userId: session.user.id })

  return (
    <HydrateClient>
      <div className='mx-auto flex min-h-0 w-full flex-1 flex-col overflow-y-auto pt-4 pb-3'>
        <ListByUserId />
      </div>
      <ChatFab context={{ page: 'list' }} className='bottom-36' />
      <ChatPanel />
    </HydrateClient>
  )
}
