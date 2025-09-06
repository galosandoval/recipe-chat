'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type Ingredient, type Recipe } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from '~/components/toast'
import { api } from '~/trpc/react'
import { z } from 'zod'
import { createId } from '@paralleldrive/cuid2'
import { useUserId } from './use-user-id'

export const useList = () => {
  const userId = useUserId()

  return api.lists.byUserId.useQuery(
    { userId },
    {
      enabled: !!userId
    }
  )
}

const selectRecipeNames = (data: Recipe[]) => {
  const nameDictionary: Record<string, string> = {}
  data.forEach((r) => (nameDictionary[r.id] = r.name))
  return nameDictionary
}

export function useRecipeNames(ids: string[]) {
  return api.recipes.byIds.useQuery(ids, {
    select: selectRecipeNames,
    enabled: ids.length > 0
  })
}

export type Checked = Record<
  string,
  { isChecked: boolean; recipeId: string | null }
>

export function useListController(data: Ingredient[]) {
  const userId = useUserId()

  // const allChecked = data.every((c) => c.checked)
  const noneChecked = data.every((c) => !c.checked)

  const utils = api.useUtils()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })
  const {
    reset,
    formState: { isValid }
  } = form

  const { mutate: addToList } = api.lists.add.useMutation({
    onMutate: async (input) => {
      await utils.lists.byUserId.cancel({ userId })

      const prevList = utils.lists.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []

      if (prevList) {
        ingredients = [
          ...prevList.ingredients,
          {
            id: input.id,
            checked: false,
            listId: '',
            name: input.newIngredientName,
            recipeId: ''
          }
        ]
      }

      utils.lists.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },

    onSuccess: async () => {
      await utils.lists.byUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.lists.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })

  const onSubmitNewIngredient = (values: FormValues) => {
    const newId = createId()
    addToList({ newIngredientName: values.newIngredientName, id: newId })
    reset()
  }

  const { mutate: deleteListItem } = api.lists.clear.useMutation({
    async onMutate(input) {
      await utils.lists.byUserId.cancel({ userId })

      const idDict = input.reduce(
        (dict, i) => {
          dict[i.id] = true
          return dict
        },
        {} as Record<string, boolean>
      )

      // Snapshot the previous value
      const prevList = utils.lists.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.filter((i) => !(i.id in idDict))
      }

      // Optimistically update to the new value

      utils.lists.byUserId.setData({ userId }, () => ({ ingredients }))
      // Return a context object with the snapshotted value
      return { prevList }
    },
    onSuccess: async () => {
      await utils.lists.byUserId.invalidate({ userId })
    },
    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.lists.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })

  const [byRecipe, setByRecipe] = useState(() =>
    typeof window !== 'undefined' && typeof localStorage.byRecipe === 'string'
      ? (JSON.parse(localStorage.byRecipe) as boolean)
      : false
  )

  const handleToggleByRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
    setByRecipe(event.target.checked)
  }

  const handleRemoveChecked = () => {
    const checkedIngredients = data.filter((i) => i.checked)

    deleteListItem(checkedIngredients)
  }

  useEffect(() => {
    localStorage.byRecipe = JSON.stringify(byRecipe)
  }, [byRecipe])

  return {
    handleToggleByRecipe,
    byRecipe,
    noneChecked,
    handleRemoveChecked,
    isValid,
    onSubmitNewIngredient,
    form
  }
}

const formSchema = z.object({
  newIngredientName: z.string().min(3).max(50)
})
type FormValues = z.infer<typeof formSchema>
