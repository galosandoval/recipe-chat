'use client'

import type { Ingredient, Recipe } from '@prisma/client'
import {
  getIngredientDisplayText,
  aggregateIngredients
} from '~/lib/ingredient-display'
import { toast } from '~/components/toast'
import { Togglebox } from '~/components/togglebox'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'

export function Lists({
  data,
  byRecipe
}: {
  data: Ingredient[]
  byRecipe: boolean
}) {
  if (byRecipe) {
    return <ListByRecipeId data={data} />
  }

  return <ListAll data={data} />
}

type IngredientsByRecipe = Record<string, Ingredient[]>

function ListByRecipeId({ data }: { data: Ingredient[] }) {
  const ids: string[] = []
  const { mutate: checkIngredient } = useCheckListItem()

  const recipeBuckets = data.reduce((buckets: IngredientsByRecipe, i) => {
    if (i.recipeId === null) {
      if (!('other' in buckets)) {
        buckets.other = []
      }

      buckets.other.push(i)
    } else {
      if (!(i.recipeId in buckets)) {
        ids.push(i.recipeId)
        buckets[i.recipeId] = []
      }

      buckets[i.recipeId].push(i)
    }

    return buckets
  }, {})

  const { data: nameDictionary, isSuccess } = useRecipeNames(ids)

  const handleCheck = (checked: boolean, ingredientId: string) => {
    checkIngredient({ id: ingredientId, checked })
  }

  return (
    <div>
      {Object.values(recipeBuckets).map((b) => (
        <div key={b[0].recipeId} className='pr-4'>
          {isSuccess && (
            <h3 className='mt-2 font-bold'>
              {b[0].recipeId ? nameDictionary[b[0].recipeId] : 'Other'}
            </h3>
          )}

          <div className='flex flex-col gap-2'>
            {b
              .toSorted((a, b) =>
                getIngredientDisplayText(a).localeCompare(
                  getIngredientDisplayText(b)
                )
              )
              .map((i) => (
                <Togglebox
                  key={i.id}
                  checked={i.checked}
                  id={i.id.toString()}
                  label={getIngredientDisplayText(i)}
                  onChange={(checked) => handleCheck(checked as boolean, i.id)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ListAll({ data }: { data: Ingredient[] }) {
  const { mutate: checkMany } = useCheckManyItems()
  const aggregated = aggregateIngredients(
    data.map((i) => ({ ...i, checked: i.checked }))
  ).toSorted((a, b) => a.displayText.localeCompare(b.displayText))

  return (
    <div className='flex flex-col gap-2'>
      {aggregated.map((group) => (
        <Togglebox
          key={group.ingredientIds.join(',')}
          checked={group.checked}
          id={group.ingredientIds.join(',')}
          label={group.displayText}
          onChange={(checked) =>
            checkMany(
              group.ingredientIds.map((id) => ({
                id,
                checked
              }))
            )
          }
        />
      ))}
    </div>
  )
}

const selectRecipeNames = (data: Recipe[]) => {
  const nameDictionary: Record<string, string> = {}
  data.forEach((r) => (nameDictionary[r.id] = r.name))
  return nameDictionary
}

function useRecipeNames(ids: string[]) {
  return api.recipes.byIds.useQuery(ids, {
    select: selectRecipeNames,
    enabled: ids.length > 0
  })
}

export function useCheckListItem() {
  const userId = useUserId()
  const utils = api.useUtils()

  return api.lists.check.useMutation({
    onMutate: async (input) => {
      await utils.lists.byUserId.cancel({ userId })

      const prevList = utils.lists.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.map((i) => {
          if (i.id === input.id) {
            return { ...i, checked: input.checked }
          }

          return i
        })
      }

      utils.lists.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },

    onSuccess: async () => {
      await utils.lists.byUserId.invalidate({ userId })
      await utils.recipes.bySlug.invalidate()
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

function useCheckManyItems() {
  const userId = useUserId()
  const utils = api.useUtils()

  return api.lists.checkMany.useMutation({
    onMutate: async (input) => {
      await utils.lists.byUserId.cancel({ userId })

      const prevList = utils.lists.byUserId.getData({ userId })
      const idSet = new Set(input.map((i) => i.id))
      const checkedMap = new Map(input.map((i) => [i.id, i.checked]))

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.map((i) => {
          if (idSet.has(i.id)) {
            return { ...i, checked: checkedMap.get(i.id) ?? i.checked }
          }
          return i
        })
      }

      utils.lists.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },

    onSuccess: async () => {
      await utils.lists.byUserId.invalidate({ userId })
      await utils.recipes.bySlug.invalidate()
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
