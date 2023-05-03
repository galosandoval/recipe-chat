import { useRouter } from 'next/router'
import { Ingredient, Instruction, Recipe } from '@prisma/client'
import Image from 'next/image'
import defaultRecipe from 'assets/default-recipe.jpeg'
import {
  useRecipeEntity,
  useRecipeIngredientsAndInstructions
} from 'hooks/recipeHooks'
import { MyHead } from 'components/Head'
import { useForm } from 'react-hook-form'
import { FormValues } from 'pages/_generate'

export default function EditByIdView() {
  const router = useRouter()
  const { id, name } = router.query

  return (
    <>
      <MyHead title={`Listy - Edit ${name}`} />
      <EditById id={parseInt(id as string)} />
    </>
  )
}

export function EditById({ id }: { id: number }) {
  const { data: recipes, status: recipesStatus } = useRecipeEntity()

  const { data: recipeInfo, status: recipeStatus } =
    useRecipeIngredientsAndInstructions(id)

  const isError = recipesStatus === 'error' && recipeStatus === 'error'
  const isSuccess = recipesStatus === 'success' && recipeStatus === 'success'

  if (isError) return <div className=''>Something went wrong</div>

  if (isSuccess && recipes && recipeInfo) {
    return <FoundRecipe data={{ ...recipeInfo, ...recipes[id] }} />
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
  const { ingredients, address, author, description, imgUrl, instructions } =
    data

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

  const { register } = useForm<FormValues>({
    defaultValues: {
      cookTime: data.cookTime || '',
      description: data.description || '',
      ingredients: data.ingredients.map((i) => i.name).join('\n') || '',
      instructions:
        data.instructions.map((i) => i.description).join('\n\n') || '',
      name: data.name || '',
      prepTime: data.prepTime || ''
    }
  })

  return (
    <div className='container prose mx-auto flex flex-col items-center pb-4'>
      <div className='flex w-full flex-col'>
        <label htmlFor='name' className='label'>
          <span className='label-text'>Name</span>
        </label>
        <input id='name' {...register('name')} className='input' />
      </div>
      <div className='flex w-full flex-col'>
        <label htmlFor='description' className='label'>
          <span className='label-text'>Description</span>
        </label>
        <textarea
          id='description'
          rows={4}
          {...register('description')}
          className='textarea resize-none'
        />
      </div>
      <div className='flex gap-2'>
        <div className='flex w-1/2 flex-col'>
          <label htmlFor='prepTime' className='label'>
            <span className='label-text'>Prep time</span>
          </label>
          <input
            id='prepTime'
            type='text'
            className='input'
            {...register('prepTime')}
          />
        </div>
        <div className='flex w-1/2 flex-col'>
          <label htmlFor='cookTime' className='label'>
            <span className='label-text'>Cook time</span>
          </label>
          <input
            id='cookTime'
            type='text'
            className='input'
            {...register('cookTime')}
          />
        </div>
      </div>

      <div className='flex w-full flex-col'>
        <label htmlFor='ingredients' className='label'>
          <span className='label-text'>Ingredients</span>
        </label>
        <textarea
          id='ingredients'
          rows={4}
          {...register('ingredients')}
          className='textarea resize-none'
        />
      </div>

      <div className='flex w-full flex-col'>
        <label htmlFor='instructions' className='label'>
          <span className='label-text'>Instructions</span>
        </label>
        <textarea
          id='instructions'
          rows={4}
          {...register('instructions')}
          className='textarea resize-none'
        />
      </div>
    </div>
  )
}
