import { zodResolver } from '@hookform/resolvers/zod'
import { Ingredient, Recipe } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { api } from 'utils/api'
import { z } from 'zod'

export const useList = () => {
  const session = useSession()
  const userId = session.data?.user.id || ''

  return api.list.byUserId.useQuery(userId, {
    enabled: !!userId
  })
}

const selectRecipeNames = (data: Recipe[]) => {
  const nameDictionary: Record<string, string> = {}
  data.forEach((r) => (nameDictionary[r.id] = r.name))
  return nameDictionary
}

export function useRecipeNames(ids: string[]) {
  return api.recipe.byIds.useQuery(ids, {
    select: selectRecipeNames
  })
}

export function useFindListId() {
  return api.list.findId.useQuery()
}

export type Checked = Record<
  string,
  { isChecked: boolean; recipeId: string | null }
>

export function useListController(data: Ingredient[]) {
  const { mutate: clearMutate, isLoading: isDeleting } = useClearList()

  const initialChecked = data.reduce((checked: Checked, i) => {
    checked[i.id] = { isChecked: false, recipeId: i.recipeId }
    return checked
  }, {})

  const [checked, setChecked] = useState(() =>
    typeof localStorage.checkedIngredients === 'string' &&
    localStorage.checkedIngredients.length > 2
      ? (JSON.parse(localStorage.checkedIngredients) as Checked)
      : initialChecked
  )

  const [byRecipe, setByRecipe] = useState(() =>
    typeof localStorage.byRecipe === 'string'
      ? (JSON.parse(localStorage.byRecipe) as boolean)
      : false
  )

  const allChecked = Object.values(checked).every((c) => c.isChecked)
  const noneChecked = Object.values(checked).every((c) => !c.isChecked)

  const handleToggleByRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
    setByRecipe(event.target.checked)
  }

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked((state) => ({
      ...state,
      [event.target.id]: {
        ...state[event.target.id],
        isChecked: event.target.checked
      }
    }))
  }

  const handleCheckAll = () => {
    if (allChecked) {
      setChecked(initialChecked)
    } else {
      for (const id in checked) {
        setChecked((state) => ({
          ...state,
          [id]: { ...state[id], isChecked: true }
        }))
      }
    }
  }

  const handleRemoveChecked = () => {
    const checkedIngredients = Object.keys(checked).reduce(
      (toRemove: { id: string; recipeId: string | null }[], c) => {
        if (checked[c].isChecked) {
          toRemove.push({ id: c, recipeId: checked[c].recipeId })
        }
        return toRemove
      },
      []
    )

    clearMutate(checkedIngredients)
  }

  useEffect(() => {
    localStorage.checkedIngredients = JSON.stringify(checked)
  }, [checked])

  useEffect(() => {
    const updateWithAddedIngredients = (
      state: React.SetStateAction<Checked>
    ) => {
      const recentlyAddedIngredients = data.filter((i) => !(i.id in state))
      const toAdd: Checked = {}
      recentlyAddedIngredients.forEach(
        (i) => (toAdd[i.id] = { isChecked: false, recipeId: i.recipeId })
      )
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
    isDeleting,
    noneChecked,
    handleRemoveChecked
  }
}

const formSchema = z.object({
  newIngredientName: z.string().min(3).max(50)
})
type FormValues = z.infer<typeof formSchema>

export function useAddIngredientForm() {
  const { data: listId, status } = useFindListId()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })

  const { mutate: addToList, status: addStatus } = useAddToList()

  const onSubmitNewIngredient = (values: FormValues) => {
    if (listId) {
      addToList({ newIngredientName: values.newIngredientName, listId })
      reset()
    }
  }

  return {
    isValid,
    addStatus,
    register,
    handleSubmit,
    onSubmitNewIngredient,
    status
  }
}

export type AddIngredientFormProps = Omit<
  ReturnType<typeof useAddIngredientForm>,
  'addStatus'
>

export function useAddToList() {
  const utils = api.useContext()
  const { data } = useSession()
  const userId = data?.user.id || ''

  return api.list.add.useMutation({
    onSuccess: () => {
      utils.list.byUserId.invalidate(userId)
    }
  })
}

export function useClearList() {
  const utils = api.useContext()
  return api.list.clear.useMutation({
    onSuccess: () => {
      utils.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}
