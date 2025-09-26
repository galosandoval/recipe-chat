'use client'

import { type Ingredient, type Recipe } from '@prisma/client'
import { toast } from '~/components/toast'
import { api } from '~/trpc/react'
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

export function useAddToList() {
  const userId = useUserId()
  const utils = api.useUtils()
  return api.lists.add.useMutation({
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
}

export function useClearList() {
  const userId = useUserId()
  const utils = api.useUtils()

  return api.lists.clear.useMutation({
    async onMutate(input) {
      await utils.lists.byUserId.cancel({ userId })

      const idDict = input.reduce(
        (dict, i) => {
          dict[i.id] = true
          return dict
        },
        {} as Record<string, boolean>
      )

      const prevList = utils.lists.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.filter((i) => !(i.id in idDict))
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
}
