'use client'

import React, { type ReactNode } from 'react'
import { type Ingredient } from '@prisma/client'
import { Checkbox } from '~/components/checkbox'
import { useListController, useRecipeNames } from '~/hooks/use-list'
import { type UseFormHandleSubmit, type UseFormRegister } from 'react-hook-form'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { Button } from '~/components/ui/button'
import { ArrowDownIcon, CirclePlusIcon, TrashIcon } from 'lucide-react'

export function ListByUserId() {
  const userId = useUserId()
  const [list] = api.lists.byUserId.useSuspenseQuery({ userId })

  return <ListController data={list?.ingredients ?? []} />
}

function ListController({ data }: { data: Ingredient[] }) {
  const t = useTranslations()

  const {
    byRecipe,
    handleCheck,
    handleRemoveChecked,
    handleToggleByRecipe,
    noneChecked,
    onSubmitNewIngredient,
    handleSubmit,
    register,
    isValid
  } = useListController(data)

  if (data.length === 0) {
    return (
      <EmptyList>
        <AddIngredientForm
          handleSubmit={handleSubmit}
          isValid={isValid}
          register={register}
          onSubmitNewIngredient={onSubmitNewIngredient}
        />
      </EmptyList>
    )
  }

  return (
    <div className='mx-2 flex flex-col'>
      <div className='mb-2 flex items-end justify-between'>
        <div className='form-control'>
          <label className='label flex cursor-pointer gap-2'>
            <span className='label-text text-base-content'>
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
        {/* break out this component */}
        <Button
          disabled={noneChecked}
          onClick={handleRemoveChecked}
          variant='destructive'
        >
          <TrashIcon />
        </Button>
      </div>
      <Lists byRecipe={byRecipe} data={data} handleCheck={handleCheck} />
      <div className='fixed bottom-0 left-0 w-full'>
        <AddIngredientForm
          isValid={isValid}
          handleSubmit={handleSubmit}
          onSubmitNewIngredient={onSubmitNewIngredient}
          register={register}
        />
      </div>
    </div>
  )
}

function EmptyList({ children }: { children: ReactNode }) {
  const t = useTranslations()

  return (
    <div className='text-primary fixed inset-0 my-auto grid place-items-center'>
      <div className='bg-base-100 rounded-lg'>
        <h1 className='text-base-content my-auto px-5 text-center text-2xl font-bold'>
          {t.list.noItems}
        </h1>
        <div className='left-0 w-full'>{children}</div>
        <div className='fixed bottom-14 left-0 flex w-full items-center justify-center gap-2 sm:bottom-16'>
          <p className='text-base-content text-center text-sm'>
            {t.list.addIngredient}
          </p>
          <div className='text-base-content animate-bounce'>
            <ArrowDownIcon className='size-4' />
          </div>
        </div>
      </div>
    </div>
  )
}

function AddIngredientForm({
  handleSubmit,
  isValid,
  onSubmitNewIngredient,
  register
}: {
  isValid: boolean
  register: UseFormRegister<{
    newIngredientName: string
  }>
  onSubmitNewIngredient: (data: { newIngredientName: string }) => void
  handleSubmit: UseFormHandleSubmit<{
    newIngredientName: string
  }>
}) {
  const t = useTranslations()

  const isDisabled = !isValid

  return (
    <form
      className='fixed bottom-0 left-0 flex w-full items-center md:rounded-md'
      onSubmit={handleSubmit(onSubmitNewIngredient)}
    >
      <div className='bg-base-300/75 mx-auto flex w-full items-center py-1 sm:mb-2 sm:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <input
            type='text'
            placeholder={t.list.addToList}
            className='input input-bordered bg-base-100/75 focus:bg-base-100 w-full'
            {...register('newIngredientName')}
          />
        </div>
        <div className='pr-2'>
          <Button disabled={isDisabled} variant='outline'>
            <CirclePlusIcon />
          </Button>
        </div>
      </div>
    </form>
  )
}

function Lists({
  data,
  byRecipe,
  handleCheck
}: {
  data: Ingredient[]
  byRecipe: boolean
  handleCheck: (
    event: React.ChangeEvent<HTMLInputElement>,
    ingredientId: string
  ) => void
}) {
  if (byRecipe) {
    return <ListByRecipeId data={data} handleCheck={handleCheck} />
  }

  return (
    <div className='flex flex-col gap-2'>
      {data.map((i, id) => (
        <Checkbox
          key={i.id ?? id}
          checked={i.checked}
          id={i.id.toString()}
          label={i.name}
          onChange={(e) => handleCheck(e, i.id)}
        />
      ))}
    </div>
  )
}

type IngredientsByRecipe = Record<string, Ingredient[]>

function ListByRecipeId({
  data,
  handleCheck
}: {
  data: Ingredient[]
  handleCheck: (
    event: React.ChangeEvent<HTMLInputElement>,
    ingredientId: string
  ) => void
}) {
  const ids: string[] = []

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
              <Checkbox
                key={i.id}
                checked={i.checked}
                id={i.id.toString()}
                label={i.name}
                onChange={(e) => handleCheck(e, i.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
