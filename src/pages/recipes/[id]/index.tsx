import { useRouter } from 'next/router'
import { Ingredient, Instruction, Recipe } from '@prisma/client'
import { ChangeEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import defaultRecipe from 'assets/default-recipe.jpeg'
import { Button } from 'components/Button'
import {
  useAddToList,
  useRecipeEntity,
  useRecipeIngredientsAndInstructions
} from 'hooks/recipeHooks'
import { Checkbox } from 'components/Checkbox'
import { MyHead } from 'components/Head'
import NoSleep from 'nosleep.js'
import { CreateList } from 'server/api/routers/list/interface'
import { listSvg, plusSvg } from 'components/Icons'
import { RecipeByIdLoader } from 'components/RecipeByIdLoader'

export default function RecipeByIdView() {
  const router = useRouter()
  const { id, name } = router.query

  useEffect(() => {
    const noSleep = new NoSleep()
    noSleep.enable()
    return () => {
      noSleep.disable()
    }
  }, [])

  return (
    <>
      <MyHead title={`Listy - ${name}`} />
      <RecipeById id={parseInt(id as string)} />
    </>
  )
}

export function RecipeById({ id }: { id: number }) {
  const { data: recipes, status: recipesStatus } = useRecipeEntity()

  const { data: recipeInfo, status: recipeStatus } =
    useRecipeIngredientsAndInstructions(id)

  const isError = recipesStatus === 'error' && recipeStatus === 'error'
  const isSuccess = recipesStatus === 'success' && recipeStatus === 'success'

  if (isError) return <div className=''>Something went wrong</div>

  if (isSuccess && recipes && recipeInfo) {
    return <FoundRecipe data={{ ...recipeInfo, ...recipes[id] }} />
  }

  return <RecipeByIdLoader />
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
    id,
    prepTime,
    cookTime
  } = data

  const { mutate, isLoading } = useAddToList(id)

  const initialChecked: Checked = {}
  ingredients.forEach((i) => (initialChecked[i.id] = true))

  const [checked, setChecked] = useState<Checked>(() => initialChecked)
  const [addedToList, setAddedToList] = useState(false)
  const router = useRouter()

  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked((state) => ({
      ...state,
      [event.target.id]: event.target.checked
    }))
  }

  const allChecked = Object.values(checked).every(Boolean)
  const noneChecked = Object.values(checked).every((i) => !i)
  const handleCheckAll = () => {
    for (const id in checked) {
      if (allChecked) {
        setChecked((state) => ({ ...state, [id]: false }))
      } else {
        setChecked((state) => ({ ...state, [id]: true }))
      }
    }
  }

  let goToListTimer: ReturnType<typeof setTimeout> | undefined = undefined
  const handleAddToList = () => {
    const checkedIngredients = ingredients.filter((i) => checked[i.id])
    const newList: CreateList = checkedIngredients
    mutate(newList)
    setAddedToList(true)

    goToListTimer = setTimeout(() => {
      setAddedToList(false)
    }, 6000)
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

  const handleGoToList = () => {
    router.push('/list')
  }

  useEffect(() => {
    return () => clearTimeout(goToListTimer)
  }, [goToListTimer])

  return (
    <div className='container prose mx-auto flex flex-col items-center pb-4'>
      <div className='flex flex-col'>
        <div className=''>
          <Image className='my-0' alt='recipe' src={imgUrl || defaultRecipe} />
        </div>
        <div className='px-4'>
          {renderAddress}
          {renderAuthor}
        </div>
      </div>

      <div className='flex flex-col px-4'>
        <p className='mb-2'>{description}</p>

        {prepTime && cookTime && (
          <div className='stats mb-2 shadow'>
            <div className='stat place-items-center'>
              <div className='stat-title'>Prep Time</div>
              <div className='stat-value text-base'>{prepTime}</div>
            </div>

            <div className='stat place-items-center'>
              <div className='stat-title'>Cook Time</div>
              <div className='stat-value text-base'>{cookTime}</div>
            </div>
          </div>
        )}
        <div className='mb-4'>
          <Button
            className={`${
              addedToList ? 'btn-accent' : 'btn-primary'
            } btn w-full gap-2`}
            disabled={noneChecked}
            onClick={addedToList ? handleGoToList : handleAddToList}
            isLoading={isLoading}
          >
            {addedToList ? listSvg : plusSvg}
            {addedToList ? 'Go to list' : 'Add to list'}
          </Button>
        </div>
        <div className=''>
          <div>
            <Checkbox
              id='check-all'
              label={allChecked ? 'Deselect All' : 'Select All'}
              checked={allChecked}
              onChange={handleCheckAll}
            />
          </div>

          <h2 className='divider'>Ingredients</h2>

          <div>
            {ingredients.map((i) => (
              <Checkbox
                id={i.id.toString()}
                checked={checked[i.id]}
                onChange={handleCheck}
                label={i.name}
                key={i.id}
              />
            ))}
          </div>
        </div>
        <div className='pt-4'>
          <h2 className='divider'>Directions</h2>
          <ol className='flex list-none flex-col gap-4 pl-0'>
            {instructions.map((i, index, array) => (
              <li key={i.id} className='bg-base-300 px-7 pb-2'>
                <h3>
                  Step {index + 1}/{array.length}
                </h3>
                <p>{i.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
