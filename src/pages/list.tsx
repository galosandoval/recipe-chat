import React from 'react'
import { Ingredient } from '@prisma/client'
import { Checkbox } from 'components/Checkbox'
import { Button } from 'components/Button'
import {
  Checked,
  useAddIngredientForm,
  useList,
  useListController,
  useRecipeNames
} from 'hooks/listHooks'
import { MyHead } from 'components/Head'

export default function ListView() {
  return (
    <>
      <MyHead title='Listy - List' />
      <div className='prose'>
        <ListByUserId />
      </div>
    </>
  )
}
export function ListByUserId() {
  const { data, status } = useList()

  if (status === 'error') {
    return <p>Something went wrong...</p>
  }

  if (status === 'success' && data) {
    if (!data.ingredients.length) {
      return <EmptyList />
    }

    return <ListController data={data.ingredients} />
  }

  return <p className=''>Loading...</p>
}

function ListController({ data }: { data: Ingredient[] }) {
  const {
    allChecked,
    byRecipe,
    handleCheck,
    handleCheckAll,
    handleRemoveChecked,
    handleToggleByRecipe,
    isLoading,
    noneChecked,
    checked
  } = useListController(data)

  return (
    <div className='mx-2 pb-5 pt-2'>
      <div className='mb-2 flex items-end justify-between'>
        <div className='form-control'>
          <label className='label flex cursor-pointer gap-2'>
            <span className='label-text'>By recipe</span>
            <input
              onChange={handleToggleByRecipe}
              type='checkbox'
              className='toggle'
              checked={byRecipe}
            />
          </label>
        </div>
        <Checkbox
          checked={allChecked}
          id='all-checked'
          label={'Check all'}
          onChange={handleCheckAll}
        />

        <Button
          isLoading={isLoading}
          disabled={noneChecked}
          onClick={handleRemoveChecked}
          className='btn-error btn'
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
      <AddIngredientForm />
      <List
        byRecipe={byRecipe}
        checked={checked}
        data={data}
        handleCheck={handleCheck}
      />
    </div>
  )
}

function EmptyList() {
  return (
    <div className='px-2'>
      <AddIngredientForm />
    </div>
  )
}

function AddIngredientForm() {
  const { handleSubmit, onSubmitNewIngredient, register, status } =
    useAddIngredientForm()

  const isDisabled = status !== 'success'

  return (
    <form
      className='form-control my-4'
      onSubmit={handleSubmit(onSubmitNewIngredient)}
    >
      <div className='input-group'>
        <input
          type='text'
          placeholder='Add to list'
          className='input-bordered input w-full'
          {...register('newIngredientName')}
        />
        <button disabled={isDisabled} className='btn-success btn-square btn'>
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
    </form>
  )
}

function List({
  data,
  checked,
  byRecipe,
  handleCheck
}: {
  data: Ingredient[]
  checked: Checked
  byRecipe: boolean
  handleCheck: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  if (byRecipe) {
    return (
      <ListByRecipeId checked={checked} data={data} handleCheck={handleCheck} />
    )
  }

  return (
    <div className='mt-2 flex flex-col divide-y divide-neutral-content'>
      {data.map((i) => (
        <Checkbox
          key={i.id}
          checked={checked[i.id].isChecked}
          id={i.id.toString()}
          label={i.name}
          onChange={handleCheck}
        />
      ))}
    </div>
  )
}

type IngredientsByRecipe = Record<string, Ingredient[]>

function ListByRecipeId({
  data,
  checked,
  handleCheck
}: {
  data: Ingredient[]
  checked: Checked
  handleCheck: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const ids: number[] = []

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
            <p>Loading...</p>
          ) : (
            <h3 className='mb-0 mt-2'>
              {b[0].recipeId ? nameDictionary[b[0].recipeId] : 'Other'}
            </h3>
          )}

          <div className='flex flex-col divide-y divide-neutral-content'>
            {b.map((i) => (
              <Checkbox
                key={i.id}
                checked={checked[i.id]?.isChecked}
                id={i.id.toString()}
                label={i.name}
                onChange={handleCheck}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
