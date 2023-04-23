import { Ingredient, Instruction, Recipe } from '@prisma/client'
import { api } from '../../utils/api'
import { ChangeEvent, useState } from 'react'
import { CreateList } from '../../server/api/routers/list'
import Image from 'next/image'
import { Button } from '../../components/Button'
import defaultRecipe from '../../assets/default-recipe.jpeg'

export function RecipeById({ id }: { id: number }) {
  const utils = api.useContext()
  const recipeEntity = utils.recipes.entity.getData()

  const {
    data: recipeInfo,
    isSuccess,
    isError
  } = api.recipes.byId.useQuery({ id })

  if (recipeInfo == undefined || isError)
    return <div className=''>Something went wrong</div>

  if (isSuccess && recipeEntity) {
    return <FoundRecipe data={{ ...recipeInfo, ...recipeEntity[id] }} />
  }

  return <div>Loading...</div>
}

type Checked = Record<string, boolean>

function FoundRecipe({
  data
}: {
  data: Recipe & {
    ingredients: Ingredient[]
    instructions: Instruction[]
  }
}) {
  const {
    ingredients,
    address,
    author,
    description,
    imgUrl,
    instructions,
    name
    // createdAt,
    // updatedAt
  } = data

  const { mutate } = api.list.create.useMutation()

  const initialChecked: Checked = {}
  ingredients.forEach((i) => (initialChecked[i.name] = true))

  const [checked, setChecked] = useState<Checked>(() => initialChecked)

  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked((state) => ({
      ...state,
      [event.target.name]: event.target.checked
    }))
  }

  const areAllChecked = Object.values(checked).every(Boolean)
  const areNoneChecked = Object.values(checked).every((i) => !i)
  const handleCheckAll = () => {
    for (const name in checked) {
      if (areAllChecked) {
        setChecked((state) => ({ ...state, [name]: false }))
      } else {
        setChecked((state) => ({ ...state, [name]: true }))
      }
    }
  }

  const handleCreateList = () => {
    const checkedIngredients = ingredients.filter((i) => checked[i.name])
    const newList: CreateList = checkedIngredients
    mutate(newList)
  }

  let renderAddress: React.ReactNode = null
  if (address) {
    renderAddress = (
      <a href={address} className=''>
        {address}
      </a>
    )
  }

  let renderAuthor: React.ReactNode = null
  if (author) {
    renderAuthor = (
      <a href={author} className=''>
        {author}
      </a>
    )
  }

  return (
    <div className='container mx-auto flex flex-col items-center gap-4 py-4 text-sm'>
      <div className='flex flex-col gap-3'>
        <h1 className='px-4 text-lg font-semibold'>{name}</h1>
        <div className=''>
          <Image alt='recipe' src={imgUrl || defaultRecipe} />
        </div>
        <div className='px-4'>
          {renderAddress}
          {renderAuthor}
        </div>
      </div>

      <div className='flex flex-col gap-1 px-4'>
        <div className=''>{description}</div>
        <div className=''>
          <Button
            props={{ disabled: areNoneChecked }}
            onClick={handleCreateList}
          >
            Add to list
          </Button>
        </div>
        <div className=''>
          <h3 className='pb-2 text-lg font-semibold text-indigo-600 '>
            Ingredients
          </h3>
          <div className='flex items-start gap-2'>
            <input
              onChange={handleCheckAll}
              checked={areAllChecked}
              className='mt-1'
              type='checkbox'
              id='check-all'
            />
            <label htmlFor='check-all'>
              {areAllChecked ? 'Deselect All' : 'Select All'}
            </label>
          </div>
          <hr className='my-2 h-px border-0 bg-gray-200 dark:bg-gray-700' />

          <ul className='flex flex-col gap-4'>
            {ingredients.map((i) => (
              <li key={i.id} className='flex items-start gap-2'>
                <input
                  className='mt-1'
                  type='checkbox'
                  name={i.name}
                  id={i.name}
                  checked={checked[i.name]}
                  onChange={handleCheck}
                />
                <label htmlFor={i.name}>{i.name}</label>
              </li>
            ))}
          </ul>
        </div>
        <div className='pt-4'>
          <h3 className='pb-2 text-lg font-semibold text-indigo-600'>
            Directions
          </h3>
          <ol className='flex list-inside list-decimal flex-col gap-4'>
            {instructions.map((i) => (
              <li key={i.id} className='bg-slate-800 p-5'>
                {i.description}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}