'use client'

import { useState } from 'react'
import type { Ingredient, Recipe } from '@prisma/client'
import {
  getIngredientDisplayText,
  getIngredientDisplayTextInPreferredUnits,
  aggregateIngredients,
  type AggregatedIngredient
} from '~/lib/ingredient-display'
import {
  IngredientItemDisplay,
  UnitBadge
} from '~/components/ingredient-item-display'
import { Badge } from '~/components/ui/badge'
import { toast } from '~/components/toast'
import { Toggle } from '~/components/toggle'
import { useTranslations } from '~/hooks/use-translations'
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
        <div key={b[0].recipeId}>
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
                  onPressedChange={(pressed) =>
                    handleCheck(pressed as boolean, i.id)
                  }
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
  const { mutate: setQuantities } = useSetQuantities()
  const aggregated = aggregateIngredients(
    data.map((i) => ({ ...i, checked: i.checked })),
    preferredWeight,
    preferredVolume
  ).toSorted((a, b) => a.displayText.localeCompare(b.displayText))

  const recipeIds = [...new Set(aggregated.flatMap((g) => g.recipeIds))]
  const { data: nameDictionary } = useRecipeNames(recipeIds)

  const ingredientsById = new Map(data.map((i) => [i.id, i]))

  return (
    <div className='flex flex-col gap-2'>
      {aggregated.map((group) => (
        <AggregatedListItem
          key={group.ingredientIds.join(',')}
          group={group}
          recipeNames={(group.recipeIds ?? [])
            .map((id) => nameDictionary?.[id])
            .filter((name): name is string => Boolean(name))}
          onCheck={(pressed) =>
            checkMany(
              group.ingredientIds.map((id) => ({ id, checked: pressed }))
            )
          }
          onAdjust={(newTotal) => {
            const updates = scaleGroupQuantities(
              group,
              newTotal,
              ingredientsById
            )
            if (updates.length > 0) setQuantities(updates)
          }}
        />
      ))}
    </div>
  )
}

/**
 * Distributes a manually edited merged total across the group's contributing
 * ingredients, scaling each proportionally so the per-recipe breakdown stays
 * consistent with the new total. When the previous total is zero, the whole
 * amount is placed on the first ingredient.
 */
function scaleGroupQuantities(
  group: AggregatedIngredient,
  newTotal: number,
  ingredientsById: Map<string, Ingredient>
): { id: string; quantity: number }[] {
  const oldTotal = group.quantity ?? 0
  if (oldTotal <= 0) {
    const [first] = group.ingredientIds
    return first ? [{ id: first, quantity: newTotal }] : []
  }
  const factor = newTotal / oldTotal
  return group.ingredientIds.map((id, index) => {
    const current = ingredientsById.get(id)?.quantity ?? 0
    const scaled = Math.round(current * factor * 1000) / 1000
    return { id, quantity: index === 0 ? Math.max(scaled, 0) : scaled }
  })
}

function AggregatedListItem({
  group,
  recipeNames,
  onCheck,
  onAdjust
}: {
  group: AggregatedIngredient
  recipeNames: string[]
  onCheck: (pressed: boolean) => void
  onAdjust: (newTotal: number) => void
}) {
  const editable = !group.unmeasured && group.quantity != null && !!group.unit

  return (
    <div className='hover:bg-accent/50 flex w-full items-center gap-2 rounded-md border p-3'>
      {editable && (
        <QuantityEditor
          value={group.quantity ?? 0}
          unit={group.unit ?? ''}
          itemName={group.itemName ?? ''}
          onCommit={onAdjust}
        />
      )}
      <Toggle
        className='flex-1 border-0 p-0 hover:bg-transparent'
        pressed={group.checked}
        id={group.ingredientIds.join(',')}
        label={
          <span className='inline-flex flex-wrap items-center gap-1.5'>
            {editable ? (
              <>
                <UnitBadge unit={group.unit ?? ''} />
                <span>{group.itemName}</span>
              </>
            ) : (
              <span>{group.displayText}</span>
            )}
            {recipeNames.map((name) => (
              <Badge key={name} variant='muted' className='px-1.5 py-0 text-xs'>
                {name}
              </Badge>
            ))}
          </span>
        }
        onPressedChange={(pressed) => onCheck(pressed)}
      />
    </div>
  )
}

/**
 * Inline numeric editor for a merged shopping-list line's total quantity.
 * Commits on blur or Enter; stops pointer events from reaching the surrounding
 * check toggle so editing never flips the checkbox.
 */
function QuantityEditor({
  value,
  unit,
  itemName,
  onCommit
}: {
  value: number
  unit: string
  itemName: string
  onCommit: (newTotal: number) => void
}) {
  const t = useTranslations()
  const [draft, setDraft] = useState(String(value))

  const commit = () => {
    const parsed = Number.parseFloat(draft)
    if (!Number.isFinite(parsed) || parsed < 0) {
      setDraft(String(value))
      return
    }
    if (parsed !== value) onCommit(parsed)
  }

  return (
    <input
      type='number'
      min={0}
      step='any'
      inputMode='decimal'
      className='border-input bg-background focus-visible:ring-ring w-16 shrink-0 rounded-md border px-2 py-1 text-sm focus-visible:ring-1 focus-visible:outline-none'
      aria-label={t.list.replace('adjustQuantity', itemName || unit)}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
    />
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

function useSetQuantities() {
  const userId = useUserId()
  const utils = api.useUtils()

  return api.lists.setQuantities.useMutation({
    onMutate: async (input) => {
      await utils.lists.byUserId.cancel({ userId })

      const prevList = utils.lists.byUserId.getData({ userId })
      const quantityMap = new Map(input.map((i) => [i.id, i.quantity]))

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.map((i) =>
          quantityMap.has(i.id)
            ? { ...i, quantity: quantityMap.get(i.id) ?? i.quantity }
            : i
        )
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
