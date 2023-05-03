import { useState } from 'react'
import { api } from '../utils/api'
import { RecipeUrlSchemaType } from 'pages/recipes'
import { useRouter } from 'next/router'

export const useRecipeEntity = () =>
  api.recipe.entity.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: Infinity
  })

export const useRecipeIngredientsAndInstructions = (id: number) =>
  api.recipe.ingredientsAndInstructions.useQuery(
    {
      id
    },
    { refetchOnWindowFocus: false, staleTime: Infinity }
  )

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

  async function onSubmitUrl(values: RecipeUrlSchemaType) {
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

export const useAddToList = () => api.list.upsert.useMutation()

export const useCreateRecipe = () => {
  const util = api.useContext()
  const router = useRouter()

  return api.recipe.create.useMutation({
    onSuccess: async (data) => {
      util.recipe.entity.invalidate()
      router.push(`/recipes/${data.id}?name=${encodeURIComponent(data.name)}`)
    }
  })
}
