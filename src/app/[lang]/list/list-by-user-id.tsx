'use client'

import React, { type ReactNode } from 'react'
import { type Ingredient } from '@prisma/client'
import { Togglebox } from '~/components/togglebox'
import { useListController, useRecipeNames } from '~/hooks/use-list'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { Button } from '~/components/ui/button'
import { ArrowDownIcon, CirclePlusIcon, TrashIcon } from 'lucide-react'
import { Form, FormInput } from '~/components/form'
import { useForm } from 'react-hook-form'
import { toast } from '~/components/toast'

export function ListByUserId() {
  const userId = useUserId()
  const [list] = api.lists.byUserId.useSuspenseQuery({ userId })

  return <ListController data={list?.ingredients ?? []} />
}

function ListController({ data }: { data: Ingredient[] }) {
  const t = useTranslations()

  const { byRecipe, handleToggleByRecipe, noneChecked, handleRemoveChecked } =
    useListController(data)

  if (data.length === 0) {
    return (
      <EmptyList>
        <AddIngredientForm data={data} />
      </EmptyList>
    )
  }

  return (
    <div className='mx-2 flex flex-col'>
      <div className='mb-2 flex items-end justify-between'>
        <div className='form-control'>
          <label className='label flex cursor-pointer gap-2'>
            <span className='label-text text-foreground'>
              {t.list.byRecipe}
            </span>
            <input
              onChange={handleToggleByRecipe}
              type='checkbox'
              className='toggle'
              checked={byRecipe}
            />
          </label>
        </div>
        <RemoveCheckedButton
          noneChecked={noneChecked}
          handleRemoveChecked={handleRemoveChecked}
        />
      </div>
      <Lists byRecipe={byRecipe} data={data} />
      <div className='fixed bottom-0 left-0 w-full'>
        <AddIngredientForm data={data} />
      </div>
    </div>
  )
}

function RemoveCheckedButton({
  noneChecked,
  handleRemoveChecked
}: {
  noneChecked: boolean
  handleRemoveChecked: () => void
}) {
  return (
    <Button
      disabled={noneChecked}
      onClick={handleRemoveChecked}
      variant='destructive'
    >
      <TrashIcon />
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
        <div className='fixed bottom-[3.2rem] left-0 flex w-full items-center justify-center gap-2 sm:bottom-16'>
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

function AddIngredientForm({ data }: { data: Ingredient[] }) {
  const t = useTranslations()

  const { onSubmitNewIngredient, isValid, form } = useListController(data)
  const isDisabled = !isValid
  return (
    <Form
      className='fixed right-0 bottom-0 left-0 flex w-full items-center md:rounded-md'
      onSubmit={onSubmitNewIngredient}
      formId='add-ingredient-form'
      form={form}
    >
      <div className='bg-secondary/75 mx-auto flex w-full items-center py-1 sm:mb-2 sm:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <FormInput
            name='newIngredientName'
            placeholder={t.list.addToList}
            className='w-full'
          />
        </div>
        <div >
          <Button disabled={isDisabled} variant='outline'>
            <CirclePlusIcon />
          </Button>
        </div>
      </div>
    </Form>
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
  const { checkIngredient } = useCheckIngredient()

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
            <h3 className='mt-2 mb-0'>
              {b[0].recipeId ? nameDictionary[b[0].recipeId] : 'Other'}
            </h3>
          )}

          <div className='flex flex-col gap-2'>
            {b.map((i) => (
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
  const { checkIngredient } = useCheckIngredient()
  return (
    <div className='flex flex-col gap-2'>
      {data.map((i, id) => (
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

function useCheckIngredient() {
  const userId = useUserId()
  const utils = api.useUtils()

  const { mutate: checkIngredient } = api.lists.check.useMutation({
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
    },

    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.lists.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })

  return { checkIngredient }
}