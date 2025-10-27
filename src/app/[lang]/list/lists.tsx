'use client'

import type { Ingredient, Recipe } from '@prisma/client'
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
              .toSorted((a, b) => a.name.localeCompare(b.name))
              .map((i) => (
                <Togglebox
                  key={i.id}
                  checked={i.checked}
                  id={i.id.toString()}
                  label={i.name}
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
  const { mutate: checkIngredient } = useCheckListItem()
  return (
    <div className='flex flex-col gap-2'>
      {data
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((i, id) => (
          <Togglebox
            key={i.id ?? id}
            checked={i.checked}
            id={i.id.toString()}
            label={i.name}
            onChange={(checked) =>
              checkIngredient({ id: i.id, checked: checked as boolean })
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
