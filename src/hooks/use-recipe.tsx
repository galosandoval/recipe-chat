import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '~/components/toast'
import { type LinkedDataRecipeField } from '~/server/api/schemas/recipes-schema'
import { useForm } from 'react-hook-form'
import { api } from '~/trpc/react'

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

export const useCreateRecipe = (data: LinkedDataRecipeField) => {
  const router = useRouter()

  const utils = api.useContext()
  const {
    description,
    recipeIngredient,
    recipeInstructions,
    name,
    cookMinutes,
    prepMinutes
  } = data
  const { mutate, isPending, isSuccess } = api.recipes.create.useMutation({
    onSuccess: async (data) => {
      router.push(`recipes/${data.id}?name=${encodeURIComponent(data.name)}`)
      await utils.recipes.invalidate()
    }
  })

  const { handleSubmit, register, getValues } = useForm<FormValues>({
    defaultValues: {
      description,
      ingredients: recipeIngredient?.join('\n'),
      instructions: recipeInstructions?.map((i) => i.text)?.join('\n'),
      name,
      cookMinutes,
      prepMinutes
    }
  })

  const onSubmit = (values: FormValues) => {
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n')
    mutate({ ...values, ingredients, instructions })
  }

  return {
    isLoading: isPending,
    isSuccess,
    mutate,
    getValues,
    onSubmit,
    handleSubmit,
    register
  }
}

export type FormValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepMinutes: number
  cookMinutes: number
}

export const useEditRecipe = () => {
  const util = api.useContext()
  const router = useRouter()

  return api.recipes.edit.useMutation({
    onSuccess: async (data, { newName }) => {
      await util.recipes.byId.invalidate({ id: data })
      router.push(`/recipes/${data}?name=${encodeURIComponent(newName)}`)
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
