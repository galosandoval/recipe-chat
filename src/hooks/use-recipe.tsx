import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { type RecipeUrlSchemaType } from '~/pages/recipes'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { type LinkedDataRecipeField } from '~/server/api/routers/recipe/interface'
import { useForm } from 'react-hook-form'

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
  api.recipe.byId.useQuery({
    id
  })

export function useParseRecipe() {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate, status, data, reset } =
    api.recipe.parseRecipeUrl.useMutation()

  function closeModal() {
    setIsOpen(false)
    setTimeout(() => {
      reset()
    }, 200)
  }

  function openModal() {
    setIsOpen(true)
  }

  function onSubmitUrl(values: RecipeUrlSchemaType) {
    mutate(values.url)
  }

  return {
    isOpen,
    status,
    data,
    openModal,
    closeModal,
    onSubmitUrl
  }
}

export const useAddToList = () => {
  const utils = api.useContext()
  return api.list.upsert.useMutation({
    onSuccess: async ({ id }) => {
      await utils.recipe.byId.invalidate({ id })
      await utils.list.invalidate()

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
    cookTime,
    prepTime
  } = data
  const { mutate, isLoading, isSuccess } = api.recipe.create.useMutation({
    onSuccess: async (data) => {
      await router.push(
        `recipes/${data.id}?name=${encodeURIComponent(data.name)}`
      )
      await utils.recipe.invalidate()
    }
  })

  const { handleSubmit, register, getValues } = useForm<FormValues>({
    defaultValues: {
      description,
      ingredients: recipeIngredient?.join('\n'),
      instructions: recipeInstructions?.map((i) => i.text)?.join('\n'),
      name,
      cookTime,
      prepTime
    }
  })

  const onSubmit = (values: FormValues) => {
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n')
    mutate({ ...values, ingredients, instructions })
  }

  return {
    isLoading,
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
  prepTime: string
  cookTime: string
}

export const useEditRecipe = () => {
  const util = api.useContext()
  const router = useRouter()

  return api.recipe.edit.useMutation({
    onSuccess: async (data, { newName }) => {
      await util.recipe.byId.invalidate({ id: data })
      await router.push(`/recipes/${data}?name=${encodeURIComponent(newName)}`)
    }
  })
}

export const useDeleteRecipe = () => {
  const utils = api.useContext()
  const router = useRouter()

  return api.recipe.delete.useMutation({
    onSuccess: async () => {
      await utils.recipe.invalidate()
      await router.push('/recipes')
      toast.success('Recipe deleted')
    }
  })
}
