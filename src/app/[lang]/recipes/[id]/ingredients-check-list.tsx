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
import { Button } from '~/components/button'
import { Checkbox } from '~/components/checkbox'
import { ListBulletIcon, PlusIcon } from '~/components/icons'
import type { Ingredient } from '@prisma/client'

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

  const handleCheck = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setChecked((state) => ({
      ...state,
      [event.target.id]: event.target.checked
    }))
  }, [])

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
      <div className='mb-4'>
        <Button
          className={`${
            addedToList ? 'btn-accent' : 'btn-primary'
          } btn w-full gap-2`}
          disabled={!someNotChecked}
          onClick={addedToList ? handleGoToList : handleAddToList}
          isLoading={isPending}
        >
          {addedToList ? <ListBulletIcon /> : <PlusIcon />}
          {addedToList ? t.recipes.byId.goToList : t.recipes.byId.addToList}
        </Button>
      </div>
      <div>
        <div>
          <Checkbox
            id='check-all'
            label={
              allChecked ? t.recipes.byId.deselectAll : t.recipes.byId.selectAll
            }
            checked={allChecked}
            onChange={handleCheckAll}
          />
        </div>

        <h2 className='divider'>{t.recipes.ingredients}</h2>
        <div className='flex flex-col gap-2'>
          {ingredients.map((i) => (
            <IngredientCheckBox
              ingredient={i}
              checked={checked}
              handleCheck={handleCheck}
              key={i.id}
            />
          ))}
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
  checked: Checked
  handleCheck: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  if (ingredient.name.endsWith(':')) {
    return (
      <h3 className='divider text-sm' key={ingredient.id}>
        {ingredient.name.slice(0, -1)}
      </h3>
    )
  }
  return (
    <Checkbox
      id={ingredient.id.toString()}
      checked={checked[ingredient.id]}
      onChange={handleCheck}
      label={ingredient.name}
      key={ingredient.id}
    />
  )
}
