'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useAddToList } from '~/hooks/use-recipe'
import { api, type RouterInputs } from '~/trpc/react'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Togglebox } from '~/components/togglebox'
import type { Ingredient } from '@prisma/client'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { Button } from '~/components/button'
import { ListChecksIcon, PlusIcon } from 'lucide-react'
import { toast } from '~/components/toast'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'

export function useCheckIngredient() {
  const utils = api.useUtils()
  const slug = useRecipeSlug()

  return api.lists.checkMany.useMutation({
    onMutate: async (input) => {
      await utils.recipes.bySlug.cancel({ slug })

      const prevRecipe = utils.recipes.bySlug.getData({ slug })

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

      utils.recipes.bySlug.setData({ slug }, () => ({
        ...prevRecipe,
        ingredients
      }))
      return { prevRecipe }
    },

    onSuccess: async () => {
      await utils.recipes.bySlug.invalidate({ slug })
      await utils.lists.invalidate()
    },

    onError: (error, _, ctx) => {
      const prevRecipe = ctx?.prevRecipe
      if (prevRecipe) {
        utils.recipes.bySlug.setData({ slug }, prevRecipe)
      }
      toast.error(error.message)
    }
  })
}

export function IngredientsCheckList({
  ingredients
}: {
  ingredients: Ingredient[]
}) {
  const t = useTranslations()
  const { slug } = useParams()
  const { mutate, isPending } = useAddToList(slug as string)
  const { mutate: checkIngredient } = useCheckIngredient()
  const [addedToList, setAddedToList] = useState(false)
  const router = useRouter()

  const handleCheck = useCallback(
    (change: { id: string; checked: boolean }) => {
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
    // Create updates for all ingredients that aren't section headers
    const updates = ingredients
      .filter((i) => !getIngredientDisplayText(i).endsWith(':'))
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
            {addedToList ? <ListChecksIcon /> : <PlusIcon />}
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
  const displayText = getIngredientDisplayText(ingredient)
  if (displayText.endsWith(':')) {
    return (
      <h3 className='mt-1 mb-1 text-sm' key={ingredient.id}>
        {displayText.slice(0, -1)}
      </h3>
    )
  }
  return (
    <Togglebox
      id={ingredient.id.toString()}
      checked={checked}
      onChange={handleCheck}
      label={displayText}
      key={ingredient.id}
    />
  )
}
