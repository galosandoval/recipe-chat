import { zodResolver } from '@hookform/resolvers/zod'
import { type Ingredient, type Recipe } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { api } from 'utils/api'
import { z } from 'zod'

export const useList = () => {
  const userId = useUserId()

  return api.list.byUserId.useQuery(
    { userId },
    {
      keepPreviousData: true,
      enabled: !!userId
    }
  )
}

export function useUserId() {
  const session = useSession()
  const userId = session.data?.user?.id ?? ''

  return userId
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

export type Checked = Record<
  string,
  { isChecked: boolean; recipeId: string | null }
>

export function useListController(data: Ingredient[]) {
  const userId = useUserId()

  const allChecked = data.every((c) => c.checked)
  const noneChecked = data.every((c) => !c.checked)

  const utils = api.useContext()

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { isValid }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })
  const { mutate: addToList, status: addStatus } = api.list.add.useMutation({
    onMutate: async (input) => {
      await utils.list.byUserId.cancel({ userId })

      const prevList = utils.list.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []

      if (prevList) {
        ingredients = [
          ...prevList.ingredients,
          {
            id: '',
            checked: false,
            listId: '',
            name: input.newIngredientName,
            recipeId: ''
          }
        ]
      }

      utils.list.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },

    onSuccess: async () => {
      await utils.list.byUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.list.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })

  const onSubmitNewIngredient = (values: FormValues) => {
    addToList({ newIngredientName: values.newIngredientName })
    reset()
    setTimeout(() => setFocus('newIngredientName'))
  }

  const { mutate: deleteListItem } = api.list.clear.useMutation({
    async onMutate(input) {
      await utils.list.byUserId.cancel({ userId })

      const idDict = input.reduce(
        (dict, i) => {
          dict[i.id] = true
          return dict
        },
        {} as Record<string, boolean>
      )

      // Snapshot the previous value
      const prevList = utils.list.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.filter((i) => !(i.id in idDict))
      }

      // Optimistically update to the new value

      utils.list.byUserId.setData({ userId }, () => ({ ingredients }))
      // Return a context object with the snapshotted value
      return { prevList }
    },
    onSuccess: async () => {
      await utils.list.byUserId.invalidate({ userId })
    },
    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.list.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })

  const [byRecipe, setByRecipe] = useState(() =>
    typeof localStorage.byRecipe === 'string'
      ? (JSON.parse(localStorage.byRecipe) as boolean)
      : false
  )

  const { mutate: checkIngredient } = api.list.check.useMutation({
    onMutate: async (input) => {
      await utils.list.byUserId.cancel({ userId })

      const prevList = utils.list.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.map((i) => {
          if (i.id === input.id) {
            return { ...i, checked: input.checked }
          }

          return i
        })
      }

      utils.list.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },

    onSuccess: async () => {
      await utils.list.byUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.list.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })

  const { mutate: checkMany } = api.list.checkMany.useMutation({
    onMutate: async () => {
      await utils.list.byUserId.cancel({ userId })

      const prevList = utils.list.byUserId.getData({ userId })

      if (prevList) {
        utils.list.byUserId.setData({ userId }, () => ({
          ingredients: prevList.ingredients.map((i) => ({
            ...i,
            checked: allChecked
          }))
        }))
      }

      return { prevList }
    },

    onSuccess: async () => {
      await utils.list.byUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.list.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })

  const handleToggleByRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
    setByRecipe(event.target.checked)
  }

  const handleCheck = (
    event: React.ChangeEvent<HTMLInputElement>,
    ingredientId: string
  ) => {
    checkIngredient({ id: ingredientId, checked: event.target.checked })
  }

  const handleCheckAll = () => {
    const checked = allChecked ? true : false

    checkMany(data.map((i) => ({ checked, id: i.id })))
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
    allChecked,
    handleCheck,
    handleCheckAll,
    noneChecked,
    handleRemoveChecked,
    isValid,
    addStatus,
    register,
    handleSubmit,
    onSubmitNewIngredient
  }
}

const formSchema = z.object({
  newIngredientName: z.string().min(3).max(50)
})
type FormValues = z.infer<typeof formSchema>
