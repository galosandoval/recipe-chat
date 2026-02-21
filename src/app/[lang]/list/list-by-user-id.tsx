'use client'

import React, { useEffect, useState } from 'react'
import { type Ingredient } from '@prisma/client'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { ArrowDownIcon } from 'lucide-react'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import type { CheckedState } from '@radix-ui/react-checkbox'
import { Lists } from './lists'
import { RemoveCheckedItemsButton } from './remove-checked-items-button'

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
        <RemoveCheckedItemsButton data={data} />
      </div>
    </div>
  )
}

function EmptyList() {
  const t = useTranslations()

  return (
    <div className='flex min-h-full flex-col items-center justify-center gap-4 px-4'>
      <h1 className='text-foreground text-center text-2xl font-bold'>
        {t.list.noItems}
      </h1>
      <p className='text-foreground text-center text-sm'>
        {t.list.addIngredient}
      </p>
      <div className='text-primary animate-bounce'>
        <ArrowDownIcon className='size-4' />
      </div>
    </div>
  )
}

