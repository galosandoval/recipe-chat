import React from 'react'
import { api } from '~/trpc/server'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { ChatPanel } from '~/components/chat-panel'
import { ListsView } from './lists-view'
import { ListsInitialDataProvider } from './lists-initial-data'

export default async function ListsPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/recipes')
  }

  // Fetch BOTH surfaces in this authenticated RSC so switching tabs is instant
  // with no loading flash, then hand them to the client tree as seeded query
  // data. Prefetch + `HydrateClient` doesn't work here: the client components
  // read with `useSuspenseQuery`, which runs during the server-render pass and
  // refetches over HTTP without the session cookie, throwing `UNAUTHORIZED`
  // (#590, same root cause as #545).
  const [groceryList, pantry, user] = await Promise.all([
    api.lists.byUserId({ userId: session.user.id }),
    api.pantry.byUserId({ userId: session.user.id }),
    api.users.get()
  ])

  return (
    <ListsInitialDataProvider
      userId={session.user.id}
      data={{ groceryList, pantry, user }}
    >
      <ListsView />
      <ChatPanel />
    </ListsInitialDataProvider>
  )
}
