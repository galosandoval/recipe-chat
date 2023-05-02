import { useState } from 'react'
import { api } from '../utils/api'
import { useRouter } from 'next/router'

export const useRecipeEntity = () =>
  api.recipe.entity.useQuery(undefined, { refetchOnWindowFocus: false })

export const useRecipeIngredientsAndInstructions = (id: number) =>
  api.recipe.ingredientsAndInstructions.useQuery(
    {
      id
    },
    { refetchOnWindowFocus: false }
  )

export function useCreateRecipeController() {
  const [isOpen, setIsOpen] = useState(false)
  const [enableParseRecipe, setEnableParseRecipe] = useState(false)

  function closeModal() {
    setIsOpen(false)
    setTimeout(() => {
      // to show UI change after closing modal
    }, 200)
  }

  function openModal() {
    setIsOpen(true)
  }

  async function onSubmitUrl() {
    setEnableParseRecipe(true)
  }

  return {
    isOpen,
    enableParseRecipe,
    openModal,
    closeModal,
    onSubmitUrl
  }
}

export function useParseRecipe(url: string, enabled: boolean) {
  const router = useRouter()
  const parseRecipe = api.recipe.parseRecipeUrl.useQuery(url, {
    enabled,
    onSuccess: (data) => {
      console.log('data', data)
      router.push(`recipes/create/${encodeURIComponent(url)}`)
    }
  })

  return parseRecipe
}
export type ParsedRecipe = ReturnType<typeof useParseRecipe>

export const useAddToList = () => api.list.upsert.useMutation()

export const useCreateRecipe = () => {
  const util = api.useContext()

  return api.recipe.create.useMutation({
    onSuccess: async () => {
      util.recipe.entity.invalidate()
    }
  })
}
