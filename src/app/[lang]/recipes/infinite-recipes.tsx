'use client'

import useDebounce from '~/hooks/use-recipe'
import { useEffect } from 'react'
import { api } from '~/trpc/react'
import { useInView } from 'react-intersection-observer'
import { RecipesPages } from './recipes-pages'
import type { InfiniteRecipes } from './get-infinite-recipes'
import type { InfiniteData } from '@tanstack/react-query'
import { recipesStore } from '~/stores/recipes-store'

const RECIPES_PER_PAGE_LIMIT = 10

export default function InfiniteRecipes({
  data: initialData
}: {
  data: InfiniteRecipes
}) {
  const { ref: inViewRef, inView } = useInView()
  const { search } = recipesStore()
  const debouncedSearch = useDebounce(search)

  // Transform server data into InfiniteData format
  const transformedInitialData: InfiniteData<
    InfiniteRecipes,
    string | null | undefined
  > = {
    pages: [initialData],
    pageParams: [undefined]
  }

  const { data, fetchNextPage, hasNextPage, fetchStatus } =
    api.recipes.infiniteRecipes.useInfiniteQuery(
      {
        limit: RECIPES_PER_PAGE_LIMIT,
        search: debouncedSearch
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: transformedInitialData
      }
    )

  const pages = data?.pages || []

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <>
      <RecipesPages pages={pages} search={search} fetchStatus={fetchStatus} />
      <span ref={inViewRef}></span>
    </>
  )
}
