import { api, HydrateClient } from '~/trpc/server'
import Recipes from './recipes'
import { Suspense } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'

export default function RecipesView() {
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
