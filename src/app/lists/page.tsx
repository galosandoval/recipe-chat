import React, { Suspense } from 'react'
import { HydrateClient, api } from '~/trpc/server'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { ChatPanel } from '~/components/chat-panel'
import { ListsView } from './lists-view'

export default async function ListsPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/recipes')
  }

  // Prefetch BOTH surfaces so switching tabs is instant with no loading flash.
  await Promise.all([
    api.lists.byUserId.prefetch({ userId: session.user.id }),
    api.pantry.byUserId.prefetch({ userId: session.user.id })
  ])

  return (
    <HydrateClient>
      <Suspense>
        <ListsView />
      </Suspense>
      <ChatPanel />
    </HydrateClient>
  )
}
