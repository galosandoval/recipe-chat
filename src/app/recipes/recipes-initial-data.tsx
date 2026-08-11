'use client'

import { api, type RouterOutputs } from '~/trpc/react'
import { useSeedQueryCache } from '~/hooks/use-seed-query-cache'
import { RECIPES_PER_PAGE_LIMIT } from './recipes-constants'

export type RecipesFirstPage = RouterOutputs['recipes']['infiniteRecipes']

/**
 * Seeds the first page of `recipes.infiniteRecipes` — the one `InfiniteRecipes`
 * reads with `useSuspenseInfiniteQuery` — from the authenticated RSC fetch.
 *
 * The seeded input must match the client's exactly (same limit, and the empty
 * search the store starts with), or the query misses the cache and fetches. The
 * page param is `null`, tRPC's initial cursor; later pages come from
 * `getNextPageParam` in the browser as usual. See {@link useSeedQueryCache}.
 */
export function RecipesInitialDataProvider({
  firstPage,
  children
}: {
  firstPage: RecipesFirstPage
  children: React.ReactNode
}) {
  const utils = api.useUtils()
  useSeedQueryCache(() => {
    utils.recipes.infiniteRecipes.setInfiniteData(
      { limit: RECIPES_PER_PAGE_LIMIT, search: '' },
      { pages: [firstPage], pageParams: [null] }
    )
  })
  return <>{children}</>
}
