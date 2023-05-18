import { Ingredient, Recipe } from '@prisma/client'
import { api } from 'utils/api'

export const useList = () => api.list.byUserId.useQuery()

const selectRecipeNames = (data: Recipe[]) => {
  const nameDictionary: Record<number, string> = {}
  data.forEach((r) => (nameDictionary[r.id] = r.name))
  return nameDictionary
}
export function useRecipeNames(ids: number[]) {
  return api.recipe.byIds.useQuery(ids, {
    select: selectRecipeNames
  })
}

export function useAddToList() {
  const utils = api.useContext()
  return api.list.add.useMutation({
    async onMutate(variables) {
      const { newIngredientName } = variables

      await utils.list.byUserId.cancel()
      const previousValue = utils.list.byUserId.getData()

      utils.list.byUserId.setData(undefined, (old) => {
        if (old?.ingredients) {
          const newList: {
            ingredients: Ingredient[]
          } = {
            ingredients: [
              ...old.ingredients,
              {
                id: 0,
                name: newIngredientName,
                listId: old.ingredients[0].listId,
                recipeId: null
              }
            ]
          }

          return newList
        }
        return old
      })

      return previousValue
    },

    onError: (_error, _, ctx) => {
      utils.list.byUserId.setData(undefined, ctx)
    },
    onSettled: () => {
      utils.list.invalidate()
    }
  })
}

export function useClearList(data: Ingredient[]) {
  const utils = api.useContext()
  return api.list.clear.useMutation({
    onSuccess() {
      utils.list.invalidate()
      const recipeIdSet = Array.from(new Set(data.map((i) => i.recipeId)))
      recipeIdSet.forEach((id) => {
        if (id) {
          utils.recipe.ingredientsAndInstructions.invalidate({ id })
        }
      })
      localStorage.checked = JSON.stringify({})
    }
  })
}
