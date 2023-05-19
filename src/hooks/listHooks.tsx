import { zodResolver } from '@hookform/resolvers/zod'
import { Ingredient, Recipe } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { addIngredientSchema } from 'server/api/routers/list/interface'
import { RouterInputs, api } from 'utils/api'

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

export type Checked = Record<string, boolean>
type AddToList = RouterInputs['list']['add']

export function useListController(data: Ingredient[]) {
  const { mutate: clearMutate, isLoading } = useClearList(data)

  const initialChecked: Checked = {}

  data.forEach((i) => (initialChecked[i.id] = false))

  const [checked, setChecked] = useState(() =>
    typeof localStorage.checked === 'string' && localStorage.checked.length > 2
      ? (JSON.parse(localStorage.checked) as Checked)
      : initialChecked
  )

  const [byRecipe, setByRecipe] = useState(() =>
    typeof localStorage.byRecipe === 'string'
      ? (JSON.parse(localStorage.byRecipe) as boolean)
      : false
  )

  const allChecked = Object.values(checked).every(Boolean)
  const noneChecked = Object.values(checked).every((c) => !c)

  const handleToggleByRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
    setByRecipe(event.target.checked)
  }

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked((state) => ({
      ...state,
      [event.target.id]: event.target.checked
    }))
  }

  const handleCheckAll = () => {
    if (allChecked) {
      setChecked(initialChecked)
    } else {
      for (const id in checked) {
        setChecked((state) => ({ ...state, [id]: true }))
      }
    }
  }

  const handleRemoveChecked = () => {
    const checkedIngredients = Object.keys(checked).reduce(
      (toRemove: { id: number }[], c) => {
        if (checked[c]) {
          toRemove.push({ id: parseInt(c) })
        }
        return toRemove
      },
      []
    )

    clearMutate(checkedIngredients)
  }

  useEffect(() => {
    localStorage.checked = JSON.stringify(checked)
  }, [checked])

  useEffect(() => {
    const updateWithAddedIngredients = (
      state: React.SetStateAction<Checked>
    ) => {
      const recentlyAddedIngredients = data.filter((i) => !(i.id in state))
      const toAdd: Checked = {}
      recentlyAddedIngredients.forEach((i) => (toAdd[i.id] = false))
      return { ...state, ...toAdd }
    }

    setChecked(updateWithAddedIngredients)
  }, [data])

  useEffect(() => {
    localStorage.byRecipe = JSON.stringify(byRecipe)
  }, [byRecipe])

  return {
    handleToggleByRecipe,
    byRecipe,
    checked,
    allChecked,
    handleCheck,
    handleCheckAll,
    isLoading,
    noneChecked,
    handleRemoveChecked
  }
}

export function useAddIngredientForm() {
  const { register, handleSubmit, reset } = useForm<AddToList>({
    resolver: zodResolver(addIngredientSchema)
  })

  const { mutate: addMutate } = useAddToList()

  const onSubmitNewIngredient = (values: AddToList) => {
    addMutate(values)
    reset()
  }

  return {
    register,
    handleSubmit,
    onSubmitNewIngredient
  }
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
