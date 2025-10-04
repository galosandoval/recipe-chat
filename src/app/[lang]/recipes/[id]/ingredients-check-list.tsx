'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useAddToList } from '~/hooks/use-recipe'
import { api, type RouterInputs } from '~/trpc/react'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Togglebox } from '~/components/togglebox'
import { ListBulletIcon, PlusIcon } from '~/components/icons'
import type { Ingredient } from '@prisma/client'
import { Button } from '~/components/ui/button'
import toast from 'react-hot-toast'

export function useCheckIngredient(recipeId: string) {
  const utils = api.useUtils()

  return api.lists.checkMany.useMutation({
    onMutate: async (input) => {
      await utils.recipes.byId.cancel({ id: recipeId })

      const prevRecipe = utils.recipes.byId.getData({ id: recipeId })

      let ingredients: Ingredient[] = []
      if (!prevRecipe) return { prevRecipe }

      // Create a map of updates for efficient processing
      const updateMap = new Map(
        input.map((update) => [update.id, update.checked])
      )

      ingredients = prevRecipe.ingredients.map((i) => {
        if (updateMap.has(i.id)) {
          return { ...i, checked: updateMap.get(i.id)! }
        }
        return i
      })

      utils.recipes.byId.setData({ id: recipeId }, () => ({
        ...prevRecipe,
        ingredients
      }))
      return { prevRecipe }
    },

    onSuccess: async () => {
      await utils.recipes.byId.invalidate({ id: recipeId })
      await utils.lists.invalidate()
    },

    onError: (error, _, ctx) => {
      const prevRecipe = ctx?.prevRecipe
      if (prevRecipe) {
        utils.recipes.byId.setData({ id: recipeId }, prevRecipe)
      }
      toast.error(error.message)
    }
  })
}

export function IngredientsCheckList({
  ingredients,
  recipeId
}: {
  ingredients: Ingredient[]
  recipeId: string
}) {
  const t = useTranslations()
  const { mutate, isPending } = useAddToList()
  const { mutate: checkIngredient } = useCheckIngredient(recipeId)
  const [addedToList, setAddedToList] = useState(false)
  const router = useRouter()

  const handleCheck = useCallback(
    (change: { id: string; checked: boolean }) => {
      console.log('event', change)
      checkIngredient([{ id: change.id, checked: change.checked }])
    },
    [checkIngredient]
  )

  const allChecked = useMemo(
    () => ingredients.every((i) => i.checked),
    [ingredients]
  )
  const someNotChecked = useMemo(
    () => ingredients.some((i) => !i.checked),
    [ingredients]
  )
  const handleCheckAll = useCallback(() => {
    // Create updates for all ingredients that aren't already in the target state
    const updates = ingredients
      .filter((i) => !i.name.endsWith(':'))
      .map((i) => ({ id: i.id, checked: !allChecked }))

    checkIngredient(updates)
  }, [allChecked, ingredients, checkIngredient])

  const goToListTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  const handleAddToList = useCallback(() => {
    const uncheckedIngredients = ingredients.filter((i) => !i.checked)
    const newList: RouterInputs['lists']['upsert'] = uncheckedIngredients
    mutate(newList)
    setAddedToList(true)

    goToListTimerRef.current = setTimeout(() => {
      setAddedToList(false)
    }, 6000)
  }, [ingredients, mutate])

  const handleGoToList = useCallback(() => {
    router.push('/list')
  }, [router])

  useEffect(() => {
    return () => {
      if (goToListTimerRef.current) {
        clearTimeout(goToListTimerRef.current)
      }
    }
  }, [])

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='text-foreground/90 text-lg font-bold'>
          {t.recipes.ingredients}
        </h2>
        <Button id='check-all' variant='outline' onClick={handleCheckAll}>
          {allChecked ? t.recipes.byId.deselectAll : t.recipes.byId.selectAll}
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        {ingredients.map((i) => (
          <IngredientCheckBox
            ingredient={i}
            checked={i.checked}
            handleCheck={(checked) => handleCheck({ id: i.id, checked })}
            key={i.id}
          />
        ))}
        <div>
          <Button
            className={'w-full justify-between gap-2 rounded-md text-base'}
            variant={addedToList ? 'default' : 'outline'}
            size='lg'
            disabled={!someNotChecked}
            onClick={addedToList ? handleGoToList : handleAddToList}
            isLoading={isPending}
          >
            {addedToList ? t.recipes.byId.goToList : t.recipes.byId.addToList}
            {addedToList ? <ListBulletIcon /> : <PlusIcon />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function IngredientCheckBox({
  ingredient,
  checked,
  handleCheck
}: {
  ingredient: Ingredient
  checked: boolean
  handleCheck: (checked: boolean) => void
}) {
  if (ingredient.name.endsWith(':')) {
    return (
      <h3 className='mt-1 mb-1 text-sm' key={ingredient.id}>
        {ingredient.name.slice(0, -1)}
      </h3>
    )
  }
  return (
    <Togglebox
      id={ingredient.id.toString()}
      checked={checked}
      onChange={handleCheck}
      label={ingredient.name}
      key={ingredient.id}
    />
  )
}
