import { useState } from 'react'
import { api } from '../utils/api'
import { RecipeUrlSchemaType } from 'pages/recipes'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

export const useRecipeEntity = () => api.recipe.entity.useQuery(undefined, {})

export const useRecipeIngredientsAndInstructions = (id: number) =>
  api.recipe.ingredientsAndInstructions.useQuery({
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

export const useAddToList = (recipeId: number) => {
  const utils = api.useContext()
  return api.list.upsert.useMutation({
    onSuccess: () => {
      utils.recipe.ingredientsAndInstructions.invalidate({ id: recipeId })
      utils.list.invalidate()

      toast.success('Added to list')
    }
  })
}

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

export const useEditRecipe = () => {
  const util = api.useContext()
  const router = useRouter()

  return api.recipe.edit.useMutation({
    onSuccess: async (data, { newName }) => {
      util.recipe.entity.invalidate()
      util.recipe.ingredientsAndInstructions.invalidate({ id: data })
      router.push(`/recipes/${data}?name=${encodeURIComponent(newName)}`)
    }
  })
}
