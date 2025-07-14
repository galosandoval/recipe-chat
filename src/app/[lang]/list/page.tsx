import React, { Suspense } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { api, HydrateClient } from '~/trpc/server'
import { ListByUserId } from './list'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'

export default async function ListView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  return (
    <HydrateClient>
      <main className='prose mx-auto min-h-svh w-full py-16'>
        <Suspense fallback={<ScreenLoader />}>
          <ListByUserId />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
