import { HydrateClient } from '~/trpc/server'
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
      <main className='prose w-full overflow-y-auto pt-20'>
        <Suspense fallback={<ScreenLoader />}>
          <Recipes />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
