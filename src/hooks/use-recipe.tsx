'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from '~/components/toast'
import { api, type RouterOutputs } from '~/trpc/react'

export function useDebounce(value: string, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

type RecipeById = RouterOutputs['recipes']['bySlug']
export type RecipeByIdData = NonNullable<RecipeById>

/**
 * Seeds the client `recipes.bySlug` query cache with the recipe the page already
 * fetched on the server, before any consumer renders.
 *
 * `useRecipe` uses `useSuspenseQuery`, which runs during the server-render (SSR)
 * pass of these client components. With an empty cache it fires an HTTP request
 * to `/api/trpc` that carries no session cookie and fails the protected-procedure
 * auth check with `UNAUTHORIZED` (#545). Writing the recipe with `setData` (as
 * opposed to a per-hook `initialData`, which React Query ignores once the query
 * already exists in the cache — e.g. after a cache-only reader ran first) marks
 * the data fresh, so the suspense query resolves synchronously on both server
 * and client and never issues that unauthenticated request.
 */
export function RecipeInitialDataProvider({
  slug,
  recipe,
  children
}: {
  slug: string
  recipe: RecipeByIdData
  children: React.ReactNode
}) {
  const utils = api.useUtils()
  // Seed during render (before children mount) so the cache is warm on the very
  // first SSR pass. `useState`'s initializer runs exactly once per mount.
  useState(() => {
    utils.recipes.bySlug.setData({ slug }, recipe)
  })
  return <>{children}</>
}

export const useRecipe = () => {
  const { slug } = useParams()
  const [data, { isLoading, isError }] = api.recipes.bySlug.useSuspenseQuery({
    slug: slug as string
  })
  return { data: data as RecipeById, isLoading, isError }
}

/**
 * Cache-only read of the current recipe for consumers rendered OUTSIDE the
 * page's {@link RecipeInitialDataProvider} (e.g. the navbar's delete dialog).
 * Unlike {@link useRecipe} it never suspends or fetches, so it can't trigger the
 * unauthenticated server-render request to a protected procedure that motivated
 * #545 — it simply reflects whatever the page's suspense query has already put
 * in the cache.
 */
export const useRecipeFromCache = () => {
  const { slug } = useParams()
  const { data } = api.recipes.bySlug.useQuery(
    { slug: slug as string },
    { enabled: false }
  )
  return { data: data as RecipeById }
}

export const useAddToList = (slug: string) => {
  const utils = api.useUtils()
  return api.lists.upsert.useMutation({
    onSuccess: async () => {
      await utils.recipes.bySlug.invalidate({ slug })
      await utils.lists.invalidate()

      toast.success('Added to list')
    }
  })
}

export const useDeleteRecipe = () => {
  const utils = api.useUtils()
  const router = useRouter()

  return api.recipes.delete.useMutation({
    onSuccess: async () => {
      await utils.recipes.invalidate()
      router.push('/recipes')
      toast.success('Recipe deleted')
    },
    onError: (error) => {
      if (error.shape?.data.stack) {
        toast.error(error.shape.data.stack)
      } else {
        toast.error('An unknown error occurred')
      }
    }
  })
}
