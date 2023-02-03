import { Ingredient, Instruction, Recipe } from '@prisma/client'
import Image from 'next/image'

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

      <div className='grid grid-cols-2 w-1/2'>
        <div className=''>
          <h3 className='text-indigo-600 font-medium text-lg '>Ingredients</h3>
          {ingredients.map((i) => (
            <p key={i.id}>{i.name}</p>
          ))}
        </div>
        <div className=''>
          <h3 className='text-indigo-600 font-medium text-lg '>Directions</h3>
          <ol className='list-decimal list-inside'>
            {instructions.map((i) => (
              <li key={i.id}>{i.description}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
