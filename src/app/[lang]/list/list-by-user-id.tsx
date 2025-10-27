'use client'

import React, { useEffect, useState, type ReactNode } from 'react'
import { type Ingredient } from '@prisma/client'
import { Togglebox } from '~/components/togglebox'
import {
  useCheckListItem,
  useClearList,
  useRecipeNames
} from '~/hooks/use-list'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { Button } from '~/components/button'
import { ArrowDownIcon, TrashIcon } from 'lucide-react'
import { AddToListForm } from './add-to-list-form'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import type { CheckedState } from '@radix-ui/react-checkbox'

export function ListByUserId() {
  const userId = useUserId()
  const [list] = api.lists.byUserId.useSuspenseQuery({ userId })

  return <ListController data={list?.ingredients ?? []} />
}

function ListController({ data }: { data: Ingredient[] }) {
  const t = useTranslations()

  const [byRecipe, setByRecipe] = useState(() =>
    typeof window !== 'undefined' && typeof localStorage.byRecipe === 'string'
      ? (JSON.parse(localStorage.byRecipe) as boolean)
      : false
  )

  const handleToggleByRecipe = (e: CheckedState) => {
    setByRecipe(e === true)
  }

  useEffect(() => {
    localStorage.byRecipe = JSON.stringify(byRecipe)
  }, [byRecipe])

  if (data.length === 0) {
    return (
      <EmptyList>
        <AddToListForm />
      </EmptyList>
    )
  }

  return (
    <div className='mx-2 flex flex-col'>
      <div className='mb-2 flex items-end justify-between'>
        <div className='form-control'>
          <Label className=''>
            <Checkbox
              onCheckedChange={(checked) => handleToggleByRecipe(checked)}
              className='toggle'
              checked={byRecipe}
            />
            <span>{t.list.byRecipe}</span>
          </Label>
        </div>
      </div>
      <Lists byRecipe={byRecipe} data={data} />
      <div className='w-full pt-2'>
        <RemoveCheckedButton data={data} />
      </div>

      <div className='fixed bottom-0 left-0 w-full'>
        <AddToListForm />
      </div>
    </div>
  )
}

function RemoveCheckedButton({ data }: { data: Ingredient[] }) {
  const t = useTranslations()
  const noneChecked = data.every((c) => !c.checked)

  const { mutate: deleteListItem } = useClearList()
  const handleRemoveChecked = () => {
    const checkedIngredients = data.filter((i) => i.checked)

    deleteListItem(checkedIngredients)
  }

  return (
    <Button
      disabled={noneChecked}
      onClick={handleRemoveChecked}
      variant='outline'
    >
      <TrashIcon />
      {t.list.removeChecked}
    </Button>
  )
}

function EmptyList({ children }: { children: ReactNode }) {
  const t = useTranslations()

  return (
    <div className='fixed inset-0 my-auto grid place-items-center'>
      <div className='bg-background rounded-lg'>
        <h1 className='text-foreground my-auto px-5 text-center text-2xl font-bold'>
          {t.list.noItems}
        </h1>
        <div className='left-0 w-full'>{children}</div>
        <div className='fixed bottom-[3.6rem] left-0 flex w-full items-center justify-center gap-2 sm:bottom-16'>
          <p className='text-foreground text-center text-sm'>
            {t.list.addIngredient}
          </p>
          <div className='text-primary animate-bounce'>
            <ArrowDownIcon className='size-4' />
          </div>
        </div>
      </div>
    </div>
  )
}

function Lists({ data, byRecipe }: { data: Ingredient[]; byRecipe: boolean }) {
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
