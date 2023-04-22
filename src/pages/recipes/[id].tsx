import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { api } from '../../utils/api'
import { useUserId } from '../../features/recipes/Create'
import { Ingredient, Instruction, Recipe } from '@prisma/client'
import { ChangeEvent, useState } from 'react'
import Image from 'next/image'
import defaultRecipe from '../../assets/default-recipe.jpeg'

export default function RecipeByIdContainer() {
  const router = useRouter()
  const { id, name } = router.query

  return (
    <div className=''>
      <Head>
        <title>Listy - {name}</title>
        <meta name='description' content='Generated by create-t3-app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout>
        <RecipeById id={parseInt(id as string)} />
      </Layout>
    </div>
  )
}

function RecipeById({ id }: { id: number }) {
  const utils = api.useContext()
  const userId = useUserId()
  const recipeEntity = utils.recipes.entity.getData({ userId })

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
    createdAt,
    description,
    id,
    imgUrl,
    instructions,
    name,
    updatedAt
  } = data

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
  const handleCheckAll = () => {
    for (const name in checked) {
      if (areAllChecked) {
        setChecked((state) => ({ ...state, [name]: false }))
      } else {
        setChecked((state) => ({ ...state, [name]: true }))
      }
    }
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
                <label htmlFor={i.name}>
                  <li>{i.name}</li>
                </label>
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
