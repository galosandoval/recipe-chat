import { api, HydrateClient } from '~/trpc/server'
import Recipes from './recipes'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'

export default async function RecipesView() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  void api.recipes.infiniteRecipes.prefetchInfinite({
    limit: 10,
    search: ''
  })

  return (
    <HydrateClient>
      <Recipes />
    </HydrateClient>
  )
}
