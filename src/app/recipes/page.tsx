import { api } from '~/trpc/server'
import InfiniteRecipes from './infinite-recipes'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { RecipesAddFab } from './recipes-add-fab'
import { RecipesInitialDataProvider } from './recipes-initial-data'
import { RECIPES_PER_PAGE_LIMIT } from './recipes-constants'

export default async function RecipesView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  // Fetch the first page here (authenticated RSC) and seed it into the client
  // cache during render — `InfiniteRecipes` reads it with
  // `useSuspenseInfiniteQuery`, which otherwise refetches during the
  // server-render pass with no session cookie and throws `UNAUTHORIZED` (#590).
  const firstPage = await api.recipes.infiniteRecipes({
    limit: RECIPES_PER_PAGE_LIMIT,
    search: ''
  })

  return (
    <RecipesInitialDataProvider firstPage={firstPage}>
      <div className='mx-auto flex min-h-0 w-full flex-1 flex-col pt-3 sm:pt-4'>
        <InfiniteRecipes />
      </div>
      <RecipesAddFab />
    </RecipesInitialDataProvider>
  )
}
