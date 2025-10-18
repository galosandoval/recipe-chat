import { HydrateClient } from '~/trpc/server'
import InfiniteRecipes from './infinite-recipes'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { getInfiniteRecipes } from './get-infinite-recipes'

export default async function RecipesView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  const data = await getInfiniteRecipes()

  return (
    <HydrateClient>
      <main className='mx-auto w-full overflow-y-auto pt-[8.75rem] sm:pt-40'>
        <InfiniteRecipes data={data} />
      </main>
    </HydrateClient>
  )
}
