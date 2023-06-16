import { useRouter } from 'next/router'
import { Ingredient, Instruction, Recipe } from '@prisma/client'
import {
  useEditRecipe,
  useRecipeEntity,
  useRecipeIngredientsAndInstructions
} from 'hooks/recipeHooks'
import { MyHead } from 'components/Head'
import { useForm } from 'react-hook-form'
import { Button } from 'components/Button'
import { UpdateRecipe } from 'server/api/routers/recipe/interface'
import { FormValues } from 'pages/chat'

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
  const {
    ingredients,
    description,
    instructions,
    name,
    prepTime,
    cookTime,
    id
  } = data

  const { mutate, isLoading } = useEditRecipe()

  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid }
  } = useForm<FormValues>({
    defaultValues: {
      cookTime: cookTime || '',
      description: description || '',
      ingredients: ingredients.map((i) => i.name).join('\n') || '',
      instructions: instructions.map((i) => i.description).join('\n') || '',
      name: name || '',
      prepTime: prepTime || ''
    }
  })

  const onSubmit = (values: FormValues) => {
    const newIngredients = values.ingredients
      .split('\n')
      .filter((i) => i.length > 2)
    const oldIngredients = [...ingredients]

    const maxIngredientsLength = Math.max(
      newIngredients.length,
      oldIngredients.length
    )
    const ingredientsToChange: { id: number; name: string; listId?: number }[] =
      []

    for (let i = 0; i < maxIngredientsLength; i++) {
      const newIngredient = newIngredients[i]
      const oldIngredient = oldIngredients[i]

      if (!!newIngredient) {
        const changedIngredient = {
          id: oldIngredient?.id || 0,
          name: newIngredient || '',
          listId: oldIngredient?.listId || undefined
        }
        ingredientsToChange.push(changedIngredient)
      }
    }

    const newInstructions = values.instructions.split('\n')
    const oldInstructions = [...instructions]

    const maxInstructionLength = Math.max(
      newInstructions.length,
      oldInstructions.length
    )

    const instructionsToChange: { id: number; description: string }[] = []

    for (let i = 0; i < maxInstructionLength; i++) {
      const newInstruction = newInstructions[i]
      const oldInstruction = oldInstructions[i]

      if (!!newInstruction) {
        instructionsToChange.push({
          id: oldInstruction?.id || 0,
          description: newInstruction || ''
        })
      }
    }

    const params: Partial<UpdateRecipe> = { id }
    if (name !== values.name) {
      params.name = values.name
    }
    if (description !== values.description) {
      params.description = values.description
    }

    mutate({
      newIngredients: ingredientsToChange,
      newName: values.name,
      newDescription: values.description,
      id,
      newInstructions: instructionsToChange,
      ingredients: oldIngredients,
      instructions: oldInstructions,
      newCookTime: values.cookTime,
      newPrepTime: values.prepTime,
      cookTime: cookTime || '',
      prepTime: prepTime || '',
      name: name || '',
      description: description || ''
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='container prose mx-2 flex flex-col items-center pb-4'
    >
      <div className='flex w-full flex-col'>
        <label htmlFor='name' className='label'>
          <span className='label-text'>Name</span>
        </label>
        <input
          id='name'
          {...register('name')}
          className='input-bordered input'
        />
      </div>
      <div className='flex w-full flex-col'>
        <label htmlFor='description' className='label'>
          <span className='label-text'>Description</span>
        </label>
        <textarea
          id='description'
          rows={4}
          {...register('description')}
          className='textarea-bordered textarea resize-none'
        />
      </div>
      <div className='flex w-full gap-2'>
        <div className='flex w-1/2 flex-col'>
          <label htmlFor='prepTime' className='label'>
            <span className='label-text'>Prep time</span>
          </label>
          <input
            id='prepTime'
            type='text'
            className='input-bordered input'
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
            className='input-bordered input mr-2'
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
          className='textarea-bordered textarea resize-none'
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
          className='textarea-bordered textarea resize-none'
        />
      </div>
      <Button
        isLoading={isLoading}
        disabled={!isDirty || !isValid}
        className='btn-primary btn mt-2 w-full'
        type='submit'
      >
        Save
      </Button>
    </form>
  )
}
