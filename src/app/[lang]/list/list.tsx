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

const backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 28' width='56' height='28'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M56 26v2h-7.75c2.3-1.27 4.94-2 7.75-2zm-26 2a2 2 0 1 0-4 0h-4.09A25.98 25.98 0 0 0 0 16v-2c.67 0 1.34.02 2 .07V14a2 2 0 0 0-2-2v-2a4 4 0 0 1 3.98 3.6 28.09 28.09 0 0 1 2.8-3.86A8 8 0 0 0 0 6V4a9.99 9.99 0 0 1 8.17 4.23c.94-.95 1.96-1.83 3.03-2.63A13.98 13.98 0 0 0 0 0h7.75c2 1.1 3.73 2.63 5.1 4.45 1.12-.72 2.3-1.37 3.53-1.93A20.1 20.1 0 0 0 14.28 0h2.7c.45.56.88 1.14 1.29 1.74 1.3-.48 2.63-.87 4-1.15-.11-.2-.23-.4-.36-.59H26v.07a28.4 28.4 0 0 1 4 0V0h4.09l-.37.59c1.38.28 2.72.67 4.01 1.15.4-.6.84-1.18 1.3-1.74h2.69a20.1 20.1 0 0 0-2.1 2.52c1.23.56 2.41 1.2 3.54 1.93A16.08 16.08 0 0 1 48.25 0H56c-4.58 0-8.65 2.2-11.2 5.6 1.07.8 2.09 1.68 3.03 2.63A9.99 9.99 0 0 1 56 4v2a8 8 0 0 0-6.77 3.74c1.03 1.2 1.97 2.5 2.79 3.86A4 4 0 0 1 56 10v2a2 2 0 0 0-2 2.07 28.4 28.4 0 0 1 2-.07v2c-9.2 0-17.3 4.78-21.91 12H30zM7.75 28H0v-2c2.81 0 5.46.73 7.75 2zM56 20v2c-5.6 0-10.65 2.3-14.28 6h-2.7c4.04-4.89 10.15-8 16.98-8zm-39.03 8h-2.69C10.65 24.3 5.6 22 0 22v-2c6.83 0 12.94 3.11 16.97 8zm15.01-.4a28.09 28.09 0 0 1 2.8-3.86 8 8 0 0 0-13.55 0c1.03 1.2 1.97 2.5 2.79 3.86a4 4 0 0 1 7.96 0zm14.29-11.86c1.3-.48 2.63-.87 4-1.15a25.99 25.99 0 0 0-44.55 0c1.38.28 2.72.67 4.01 1.15a21.98 21.98 0 0 1 36.54 0zm-5.43 2.71c1.13-.72 2.3-1.37 3.54-1.93a19.98 19.98 0 0 0-32.76 0c1.23.56 2.41 1.2 3.54 1.93a15.98 15.98 0 0 1 25.68 0zm-4.67 3.78c.94-.95 1.96-1.83 3.03-2.63a13.98 13.98 0 0 0-22.4 0c1.07.8 2.09 1.68 3.03 2.63a9.99 9.99 0 0 1 16.34 0z'%3E%3C/path%3E%3C/svg%3E")`
function EmptyList({ children }: { children: ReactNode }) {
  const t = useTranslations()

  return (
    <div className='text-primary my-auto grid h-full place-items-center'>
      <div
        className='bg-base-100 rounded-lg'
        style={{
          backgroundImage
        }}
      >
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
                d='M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
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
    <div className='pb-24'>
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
