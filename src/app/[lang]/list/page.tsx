import React from 'react'
import { HydrateClient, api } from '~/trpc/server'
import { ListByUserId } from './list-by-user-id'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'

export default async function ListView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/recipes')
  }

  // Prefetch user's list data into React Query cache
  await api.lists.byUserId.prefetch({ userId: session.user.id })

  return (
    <HydrateClient>
      <main className='mx-auto w-full overflow-y-auto pt-4 pb-20'>
        <ListByUserId />
      </main>
    </HydrateClient>
  )
}
