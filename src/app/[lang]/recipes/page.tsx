import { api, HydrateClient } from '~/trpc/server'
import Recipes from './recipes'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'

export default async function RecipesView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  return (
    <HydrateClient>
      <Suspense fallback={<ScreenLoader />}>
        <Recipes />
      </Suspense>
    </HydrateClient>
  )
}
