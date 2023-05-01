import React, { useEffect, useState } from 'react'
import { api } from 'utils/api'
import { Ingredient } from '@prisma/client'
import { Checkbox } from 'components/Checkbox'
import { Button } from 'components/Button'
import { useList, useRecipeNames } from 'hooks/listHooks'
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

  if (status === 'success') {
    if (!data || !data.ingredients.length) {
      return <p>Your list is empty</p>
    }

    return <ListController data={data.ingredients} />
  }

  return <p className=''>Loading...</p>
}

type Checked = Record<string, boolean>

function ListController({ data }: { data: Ingredient[] }) {
  const utils = api.useContext()
  const { mutate, isLoading } = api.list.clear.useMutation({
    onSuccess() {
      utils.list.invalidate()
      localStorage.checked = JSON.stringify({})
    }
  })
  const initialChecked: Checked = {}

  data.forEach((i) => (initialChecked[i.id] = false))

  const [checked, setChecked] = useState(() =>
    typeof localStorage.checked === 'string' && localStorage.checked.length > 2
      ? (JSON.parse(localStorage.checked) as Checked)
      : initialChecked
  )

  const [byRecipe, setByRecipe] = useState(() =>
    typeof localStorage.byRecipe === 'string'
      ? (JSON.parse(localStorage.byRecipe) as boolean)
      : false
  )

  const allChecked = Object.values(checked).every(Boolean)
  const noneChecked = Object.values(checked).every((c) => !c)

  const handleToggleByRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
    setByRecipe(event.target.checked)
  }

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked((state) => ({
      ...state,
      [event.target.id]: event.target.checked
    }))
  }

  const handleCheckAll = () => {
    if (allChecked) {
      setChecked(initialChecked)
    } else {
      for (const id in checked) {
        setChecked((state) => ({ ...state, [id]: true }))
      }
    }
  }

  const handleRemoveChecked = () => {
    const checkedIngredients = Object.keys(checked).reduce(
      (toRemove: { id: number }[], c) => {
        if (checked[c]) {
          toRemove.push({ id: parseInt(c) })
        }
        return toRemove
      },
      []
    )

    mutate(checkedIngredients)
  }

  useEffect(() => {
    localStorage.checked = JSON.stringify(checked)
  }, [checked])

  useEffect(() => {
    const updateWithAddedIngredients = (
      state: React.SetStateAction<Checked>
    ) => {
      const recentlyAddedIngredients = data.filter((i) => !(i.id in state))
      const toAdd: Checked = {}
      recentlyAddedIngredients.forEach((i) => (toAdd[i.id] = false))
      return { ...state, ...toAdd }
    }

    setChecked(updateWithAddedIngredients)
  }, [data])

  useEffect(() => {
    localStorage.byRecipe = JSON.stringify(byRecipe)
  }, [byRecipe])

  return (
    <div className=''>
      <h1>Your ingredients list</h1>
      <div className='form-control'>
        <label className='label cursor-pointer'>
          <span className='label-text'>By recipe</span>
          <input
            onChange={handleToggleByRecipe}
            type='checkbox'
            className='toggle'
            checked={byRecipe}
          />
        </label>
      </div>

      <div className=''>
        <Checkbox
          checked={allChecked}
          id='all-checked'
          label={'Check all'}
          onChange={handleCheckAll}
        />
      </div>

      <List
        byRecipe={byRecipe}
        checked={checked}
        data={data}
        handleCheck={handleCheck}
      />

      <Button
        isLoading={isLoading}
        disabled={noneChecked}
        onClick={handleRemoveChecked}
        className='btn-secondary btn'
      >
        Clear list
      </Button>
    </div>
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
    <div className=''>
      {data.map((i) => (
        <Checkbox
          key={i.id}
          checked={checked[i.id]}
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
    if (!(i.recipeId in buckets)) {
      ids.push(i.recipeId)
      buckets[i.recipeId] = []
    }

    buckets[i.recipeId].push(i)

    return buckets
  }, {})

  const { data: nameDictionary, isSuccess } = useRecipeNames(ids)

  return (
    <div className=''>
      {Object.values(recipeBuckets).map((b) => (
        <div className='' key={b[0].recipeId}>
          {!isSuccess ? (
            <p>Loading...</p>
          ) : (
            <h3>{nameDictionary[b[0].recipeId]}</h3>
          )}

          {b.map((i) => (
            <Checkbox
              key={i.id}
              checked={checked[i.id]}
              id={i.id.toString()}
              label={i.name}
              onChange={handleCheck}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
