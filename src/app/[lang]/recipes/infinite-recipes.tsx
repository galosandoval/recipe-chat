'use client'

import useDebounce from '~/hooks/use-recipe'
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { api } from '~/trpc/react'
import { useInView } from 'react-intersection-observer'
import { SearchBarWrapper } from './search-bar-wrapper'
import { RecipesPages } from './recipes-pages'
import type { InfiniteRecipes } from './get-infinite-recipes'
import type { InfiniteData } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'

const RECIPES_PER_PAGE_LIMIT = 10

export default function InfiniteRecipes({
  data: initialData
}: {
  data: InfiniteRecipes
}) {
  const { ref: inViewRef, inView } = useInView()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(search)
  const router = useRouter()

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

  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }, [])

  const handleSearchButtonClick = useCallback(
    !!search
      ? () =>
          handleChange({
            target: { value: '' }
          } as ChangeEvent<HTMLInputElement>)
      : () => inputRef.current?.focus(),
    [search]
  )

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  useEffect(() => {
    router.push(`/recipes?search=${search}`)
    if (search === '') {
      inputRef.current?.focus()
    }
  }, [search])

  return (
    <SearchBarWrapper
      handleChange={handleChange}
      handleSearchButtonClick={handleSearchButtonClick}
      inputRef={inputRef}
      search={search}
    >
      <RecipesPages pages={pages} search={search} fetchStatus={fetchStatus} />
      <span ref={inViewRef}></span>
    </SearchBarWrapper>
  )
}
