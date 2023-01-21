import { Ingredient, Instruction, Recipe } from '@prisma/client'
import Image from 'next/image'
import React, {
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useState
} from 'react'
import { trpc } from '../../utils/trpc'
import defaultRecipe from '../../assets/default-recipe.jpeg'

export default function RecipeById({ id }: { id: number }) {
  const utils = trpc.useContext()
  const recipeEntity = utils.recipeEntity.getData({ userId: 1 })

  const {
    data: recipeInfo,
    isSuccess,
    isError
  } = trpc.recipeById.useQuery({
    id
  })

  if (recipeInfo == undefined || isError)
    return <div className=''>Something went wrong</div>

  if (isSuccess && recipeEntity) {
    console.log('recipeEntity', recipeEntity)
    return <FoundRecipe data={{ ...recipeInfo, ...recipeEntity[id] }} />
  }

  return <div>Loading...</div>
}

type TabType = 'ingredients' | 'instructions'

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

  const [tab, setTab] = useState<TabType>('ingredients')

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

  const renderIngredients = (
    <div className=''>
      {ingredients.map((i) => (
        <p key={i.id}>{i.name}</p>
      ))}
    </div>
  )

  const renderInstructions = (
    <div className=''>
      {instructions.map((i) => (
        <p key={i.id}>{i.description}</p>
      ))}
    </div>
  )

  let tabToRender = renderIngredients
  if (tab == 'instructions') {
    tabToRender = renderInstructions
  }

  const handleChangeTab = (e: MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget.name)
    setTab(e.currentTarget.name as TabType)
  }

  return (
    <div className='container mx-auto flex justify-between'>
      <div className=''>
        <div className='flex flex-col'>
          <h1 className=''>{name}</h1>
          {renderAddress}
          {renderAuthor}
        </div>

        <div className=''>
          <div className=''>
            <button onClick={handleChangeTab} name='ingredients' className=''>
              Ingredients
            </button>
            <button onClick={handleChangeTab} name='instructions' className=''>
              Instructions
            </button>
          </div>
          {tabToRender}
        </div>
      </div>
      <div className=''>
        <Image alt='recipe' src={imgUrl || defaultRecipe} />
      </div>
    </div>
  )
}
