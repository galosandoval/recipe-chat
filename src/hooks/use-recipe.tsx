'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from '~/components/toast'
import { api, type RouterOutputs } from '~/trpc/react'

export default function useDebounce(value: string, delay = 500) {
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

type RecipeById = RouterOutputs['recipes']['byId']
export type RecipeByIdData = NonNullable<RecipeById>

export const useRecipe = (
  options?: Parameters<typeof api.recipes.byId.useQuery>[1]
) => {
  const { id } = useParams()
  const { data, isLoading, isError } = api.recipes.byId.useQuery(
    {
      id: id as string
    },
    options
  )
  return { data: data as RecipeById, isLoading, isError }
}

export const useAddToList = () => {
  const utils = api.useUtils()
  return api.lists.upsert.useMutation({
    onSuccess: async ({ id }) => {
      await utils.recipes.byId.invalidate({ id })
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
