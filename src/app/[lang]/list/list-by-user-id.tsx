'use client'

import React, { useEffect, useState, type ReactNode } from 'react'
import { type Ingredient } from '@prisma/client'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { Button } from '~/components/button'
import { ArrowDownIcon, TrashIcon } from 'lucide-react'
import { AddToListForm } from './add-to-list-form'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import type { CheckedState } from '@radix-ui/react-checkbox'
import { Lists } from './lists'
import { toast } from '~/components/toast'

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

function useClearList() {
  const userId = useUserId()
  const utils = api.useUtils()

  return api.lists.clear.useMutation({
    async onMutate(input) {
      await utils.lists.byUserId.cancel({ userId })

      const idDict = input.reduce(
        (dict, i) => {
          dict[i.id] = true
          return dict
        },
        {} as Record<string, boolean>
      )

      const prevList = utils.lists.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.filter((i) => !(i.id in idDict))
      }

      utils.lists.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },
    onSuccess: async () => {
      await utils.lists.byUserId.invalidate({ userId })
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
