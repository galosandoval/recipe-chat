import { Ingredient, Instruction, Recipe } from '@prisma/client'
import Image from 'next/image'

import { api } from '../../utils/api'
import defaultRecipe from '../../assets/default-recipe.jpeg'
import { useUserId } from './Create'

export default function RecipeById({ id }: { id: number }) {
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
    console.log('recipeEntity', recipeEntity)
    return <FoundRecipe data={{ ...recipeInfo, ...recipeEntity[id] }} />
  }

  return <div>Loading...</div>
}

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
    <div className='container mx-auto flex flex-col items-center'>
      <div className='flex flex-col'>
        <div className=''>
          <Image alt='recipe' src={imgUrl || defaultRecipe} />
        </div>
        <h1 className=''>{name}</h1>
        {renderAddress}
        {renderAuthor}
      </div>

      <div className='grid w-1/2 grid-cols-2'>
        <div className=''>
          <h3 className='text-lg font-medium text-indigo-600 '>Ingredients</h3>
          {ingredients.map((i) => (
            <p key={i.id}>{i.name}</p>
          ))}
        </div>
        <div className=''>
          <h3 className='text-lg font-medium text-indigo-600 '>Directions</h3>
          <ol className='list-inside list-decimal'>
            {instructions.map((i) => (
              <li key={i.id}>{i.description}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
