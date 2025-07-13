import React, { Suspense } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { api, HydrateClient } from '~/trpc/server'
import { ListByUserId } from './list'
import { auth } from '~/server/auth'

export default async function ListView() {
  const session = await auth()
  if (!session?.user.id) {
    return <div>Not logged in</div>
  }
  const data = await api.lists.byUserId({ userId: session.user.id })

  if (!data) {
    return <div>No data</div>
  }

  return (
    <HydrateClient>
      <main className='prose mx-auto min-h-svh w-full py-16'>
        <Suspense fallback={<ScreenLoader />}>
          <ListByUserId data={data.ingredients} />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
