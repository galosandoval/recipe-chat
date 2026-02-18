import React from 'react'
import { HydrateClient, api } from '~/trpc/server'
import { PantryByUserId } from './pantry-by-user-id'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'

export default async function PantryView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/recipes')
  }

  await api.pantry.byUserId.prefetch({ userId: session.user.id })

  return (
    <HydrateClient>
      <main className='mx-auto w-full overflow-y-auto pt-24 pb-20'>
        <PantryByUserId />
      </main>
    </HydrateClient>
  )
}
