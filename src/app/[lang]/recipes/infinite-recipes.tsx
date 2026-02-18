'use client'

import { useDebounce } from '~/hooks/use-recipe'
import { useEffect } from 'react'
import { api } from '~/trpc/react'
import { useInView } from 'react-intersection-observer'
import { Recipes } from './recipes'
import { recipesStore } from '~/stores/recipes-store'

// on a desktop the user sees 12 at most
const RECIPES_PER_PAGE_LIMIT = 12

export default function InfiniteRecipes() {
  const { ref: inViewRef, inView } = useInView()
  const { search } = recipesStore()
  const debouncedSearch = useDebounce(search)

  const [data, { fetchNextPage, hasNextPage, fetchStatus, isSuccess }] =
    api.recipes.infiniteRecipes.useSuspenseInfiniteQuery(
      {
        limit: RECIPES_PER_PAGE_LIMIT,
        search: debouncedSearch
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
    )

  const pages = data?.pages || []
  const recipes = pages.flatMap((page) => page.items)

  // Update URL after successful search using History API (doesn't trigger re-renders)
  useEffect(() => {
    if (isSuccess) {
      const url = new URL(window.location.href)
      if (debouncedSearch) {
        url.searchParams.set('search', debouncedSearch)
      } else {
        url.searchParams.delete('search')
      }
      window.history.replaceState({}, '', url.toString())
    }
  }, [debouncedSearch, isSuccess])

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <>
      <Recipes recipes={recipes} search={search} fetchStatus={fetchStatus} />
      <span ref={inViewRef}></span>
    </>
  )
}
