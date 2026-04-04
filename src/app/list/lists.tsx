'use client'

import type { Ingredient, Recipe } from '@prisma/client'
import {
  getIngredientDisplayText,
  getIngredientDisplayTextInPreferredUnits,
  aggregateIngredients
} from '~/lib/ingredient-display'
import { IngredientItemDisplay } from '~/components/ingredient-item-display'
import { toast } from '~/components/toast'
import { Toggle } from '~/components/toggle'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'

export function Lists({
  data,
  byRecipe
}: {
  data: Ingredient[]
  byRecipe: boolean
}) {
  const { data: user } = api.users.get.useQuery()
  const preferredWeight = user?.preferredWeightUnit ?? null
  const preferredVolume = user?.preferredVolumeUnit ?? null

  if (byRecipe) {
    return (
      <ListByRecipeId
        data={data}
        preferredWeight={preferredWeight}
        preferredVolume={preferredVolume}
      />
    )
  }

  return (
    <ListAll
      data={data}
      preferredWeight={preferredWeight}
      preferredVolume={preferredVolume}
    />
  )
}

type IngredientsByRecipe = Record<string, Ingredient[]>

function ListByRecipeId({
  data,
  preferredWeight,
  preferredVolume
}: {
  data: Ingredient[]
  preferredWeight: string | null
  preferredVolume: string | null
}) {
  const ids: string[] = []
  const { mutate: checkIngredient } = useCheckListItem()

  const displayText = (i: Ingredient) =>
    getIngredientDisplayTextInPreferredUnits(
      i,
      preferredWeight,
      preferredVolume
    ) || getIngredientDisplayText(i)

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
        <div key={b[0].recipeId} >
          {isSuccess && (
            <h3 className='mt-2 font-bold'>
              {b[0].recipeId ? nameDictionary[b[0].recipeId] : 'Other'}
            </h3>
          )}

          <div className='flex flex-col gap-2'>
            {b
              .toSorted((a, b) => displayText(a).localeCompare(displayText(b)))
              .map((i) => (
                <Toggle
                  key={i.id}
                  pressed={i.checked}
                  id={i.id.toString()}
                  label={
                    <IngredientItemDisplay
                      ingredient={i}
                      preferredWeightUnit={preferredWeight}
                      preferredVolumeUnit={preferredVolume}
                    />
                  }
                  onPressedChange={(pressed) => handleCheck(pressed as boolean, i.id)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ListAll({
  data,
  preferredWeight,
  preferredVolume
}: {
  data: Ingredient[]
  preferredWeight: string | null
  preferredVolume: string | null
}) {
  const { mutate: checkMany } = useCheckManyItems()
  const aggregated = aggregateIngredients(
    data.map((i) => ({ ...i, checked: i.checked })),
    preferredWeight,
    preferredVolume
  ).toSorted((a, b) => a.displayText.localeCompare(b.displayText))

  return (
    <div className='flex flex-col gap-2'>
      {aggregated.map((group) => (
        <Toggle
          key={group.ingredientIds.join(',')}
          pressed={group.checked}
          id={group.ingredientIds.join(',')}
          label={group.displayText}
          onPressedChange={(pressed) =>
            checkMany(
              group.ingredientIds.map((id) => ({
                id,
                checked: pressed
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
