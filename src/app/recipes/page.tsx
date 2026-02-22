import { HydrateClient, api } from '~/trpc/server'
import InfiniteRecipes from './infinite-recipes'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { RecipesAddFab } from './recipes-add-fab'

const RECIPES_PER_PAGE_LIMIT = 10

export default async function RecipesView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  // Prefetch infinite query data into React Query cache
  await api.recipes.infiniteRecipes.prefetchInfinite({
    limit: RECIPES_PER_PAGE_LIMIT,
    search: ''
  })

  return (
    <HydrateClient>
      <main className='mx-auto w-full pt-3 sm:pt-4'>
        <InfiniteRecipes />
      </main>
      <RecipesAddFab />
    </HydrateClient>
  )
}
