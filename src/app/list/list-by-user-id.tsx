'use client'

import React, { useEffect, useState } from 'react'
import { type Ingredient } from '@prisma/client'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { PlusIcon, ShoppingCartIcon } from 'lucide-react'
import type { CheckedState } from '@radix-ui/react-checkbox'
import { AddCheckedToPantryButton } from './add-checked-to-pantry-button'
import { Lists } from './lists'
import { RemoveCheckedItemsButton } from './remove-checked-items-button'
import { Toggle } from '~/components/toggle'
import { Button } from '~/components/button'

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
    return <EmptyList />
  }

  return (
    <div className='mx-2 flex flex-col'>
      <div className='mb-2 flex items-end justify-between'>
        <div className='form-control'>
          <Toggle
            pressed={byRecipe}
            onPressedChange={(pressed) => handleToggleByRecipe(pressed)}
            className='toggle'
            label={t.list.byRecipe}
            id='byRecipe'
          />
        </div>
      </div>
      <Lists byRecipe={byRecipe} data={data} />
      <div className='w-full pt-2'>
        <RemoveCheckedItemsButton data={data} />
        <AddCheckedToPantryButton data={data} />
      </div>
    </div>
  )
}

function EmptyList() {
  const t = useTranslations()

  const focusFooterInput = () => {
    const input = document.getElementById('add-to-list-input')
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    input?.focus()
  }

  return (
    <div className='flex min-h-[60vh] flex-1 items-center justify-center px-4'>
      <div className='flex max-w-md flex-col items-center gap-4 text-center'>
        <div className='text-muted-foreground'>
          <ShoppingCartIcon size={80} />
        </div>
        <div className='space-y-2'>
          <h3 className='text-foreground text-xl font-semibold'>
            {t.list.noItems}
          </h3>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t.list.addIngredient}
          </p>
        </div>
        <Button
          icon={<PlusIcon className='size-4' />}
          variant='default'
          className='mt-2'
          onClick={focusFooterInput}
        >
          {t.list.addFirstItem}
        </Button>
      </div>
    </div>
  )
}
