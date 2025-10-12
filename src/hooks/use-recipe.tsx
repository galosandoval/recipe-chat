import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '~/components/toast'
import { useForm } from 'react-hook-form'
import { api } from '~/trpc/react'
import type { LinkedDataRecipeField } from '~/schemas/recipes-schema'

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

export const useRecipe = (id: string) =>
  api.recipes.byId.useQuery({
    id
  })

export const useAddToList = () => {
  const utils = api.useContext()
  return api.lists.upsert.useMutation({
    onSuccess: async ({ id }) => {
      await utils.recipes.byId.invalidate({ id })
      await utils.lists.invalidate()

      toast.success('Added to list')
    }
  })
}

export const useDeleteRecipe = () => {
  const utils = api.useContext()
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
