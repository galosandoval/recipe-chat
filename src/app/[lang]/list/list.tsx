'use client'

import React, { type ReactNode } from 'react'
import { type Ingredient } from '@prisma/client'
import { Checkbox } from '~/components/checkbox'
import { Button } from '~/components/button'
import { useListController, useRecipeNames } from '~/hooks/use-list'
import { type UseFormHandleSubmit, type UseFormRegister } from 'react-hook-form'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { AddCircleIcon } from '~/components/icons'

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
            <span className='label-text'>{t.list.byRecipe}</span>
            <input
              onChange={handleToggleByRecipe}
              type='checkbox'
              className='toggle'
              checked={byRecipe}
            />
          </label>
        </div>

        <Button
          disabled={noneChecked}
          onClick={handleRemoveChecked}
          className='btn btn-error'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
            />
          </svg>
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
    <div className='text-primary my-auto grid h-96 place-items-center'>
      <div className='bg-base-100 rounded-lg'>
        <h1 className='text-primary my-auto px-5 text-center'>
          {t.list.noItems}
        </h1>
        <div className='fixed bottom-0 left-0 w-full'>{children}</div>
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
      <div className='prose bg-base-300/75 mx-auto flex w-full items-center py-1 sm:mb-2 sm:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <input
            type='text'
            placeholder={t.list.addToList}
            className='input input-bordered bg-base-100/75 focus:bg-base-100 w-full'
            {...register('newIngredientName')}
          />
        </div>
        <div className='pr-2'>
          <button disabled={isDisabled} className='btn btn-square btn-success'>
            <AddCircleIcon />
          </button>
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
    <div className='divide-neutral-content flex flex-col divide-y'>
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
  const t = useTranslations()

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
          {!isSuccess ? (
            <p>{t.loading.screen}</p>
          ) : (
            <h3 className='mt-2 mb-0'>
              {b[0].recipeId ? nameDictionary[b[0].recipeId] : 'Other'}
            </h3>
          )}

          <div className='divide-neutral-content flex flex-col divide-y'>
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
