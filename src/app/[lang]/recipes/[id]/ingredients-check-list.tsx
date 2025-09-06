'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useAddToList } from '~/hooks/use-recipe'
import { type RouterInputs } from '~/trpc/react'
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  type ChangeEvent
} from 'react'
import { useRouter } from 'next/navigation'
import { Togglebox } from '~/components/togglebox'
import { ListBulletIcon, PlusIcon } from '~/components/icons'
import type { Ingredient } from '@prisma/client'
import { Button } from '~/components/ui/button'

type Checked = Record<string, boolean>

export function IngredientsCheckList({
  ingredients
}: {
  ingredients: Ingredient[]
}) {
  const t = useTranslations()
  const { mutate, isPending } = useAddToList()

  const initialChecked: Checked = ingredients.reduce((acc, i) => {
    if (!i.name.endsWith(':')) {
      acc[i.id] = i.checked
    }
    return acc
  }, {} as Checked)

  const [checked, setChecked] = useState<Checked>(() => initialChecked)
  const [addedToList, setAddedToList] = useState(false)
  const router = useRouter()

  const handleCheck = useCallback(
    (change: { id: string; checked: boolean }) => {
      console.log('event', change)
      setChecked((state) => ({
        ...state,
        [change.id]: change.checked
      }))
    },
    []
  )

  const allChecked = useMemo(
    () => Object.values(checked).every(Boolean),
    [checked]
  )
  const someNotChecked = useMemo(
    () => Object.values(checked).some((i) => !i),
    [checked]
  )
  const handleCheckAll = useCallback(() => {
    setChecked((state) => {
      const newState = { ...state }
      for (const id in newState) {
        newState[id] = !allChecked
      }
      return newState
    })
  }, [allChecked])

  const goToListTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  const handleAddToList = useCallback(() => {
    const uncheckedIngredients = ingredients.filter((i) => !checked[i.id])
    const newList: RouterInputs['lists']['upsert'] = uncheckedIngredients
    mutate(newList)
    setAddedToList(true)

    goToListTimerRef.current = setTimeout(() => {
      setAddedToList(false)
    }, 6000)
  }, [ingredients, checked, mutate])

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
    <>
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <h2 className='text-foreground/90 text-lg font-bold'>
            {t.recipes.ingredients}
          </h2>
          <Togglebox
            id='check-all'
            label={
              allChecked ? t.recipes.byId.deselectAll : t.recipes.byId.selectAll
            }
            checked={allChecked}
            onChange={handleCheckAll}
          />
        </div>

        <div className='flex flex-col gap-2'>
          {ingredients.map((i) => (
            <IngredientCheckBox
              ingredient={i}
              checked={checked[i.id]}
              handleCheck={(checked) => handleCheck({ id: i.id, checked })}
              key={i.id}
            />
          ))}
          <div className=''>
            <Button
              className={'w-full justify-between gap-2 rounded text-base'}
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
    </>
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
      <h3 className='divider mt-1 mb-1 text-sm' key={ingredient.id}>
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
