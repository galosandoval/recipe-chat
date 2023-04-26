import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../utils/api'
import { Button } from '../components/Button'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import { FormSkeleton } from '../components/FormSkeleton'
import { CreateRecipeForm } from '../components/CreateRecipeForm'
import { GeneratedRecipe } from '../server/api/routers/recipes'

export type FormValues = {
  name: string
  ingredients: string
  instructions: string
  description: string
  prepTime: string
  cookTime: string
}

const generateRecipeFormSchema = z.object({ message: z.string().min(6) })
type GenerateRecipeParams = z.infer<typeof generateRecipeFormSchema>

export default function GenerateRecipe() {
  const [isGenRecipeOpen, setIsGenRecipeOpen] = useState(false)
  const genRecipe = api.recipes.generate.useMutation()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<GenerateRecipeParams>()

  const onSubmit = async (values: GenerateRecipeParams) => {
    setIsGenRecipeOpen(true)
    genRecipe.mutate(values)
  }

  const handleCloseModal = () => {
    setIsGenRecipeOpen(false)
  }

  console.log('data', genRecipe.data)
  console.log('data', genRecipe.data?.description)

  return (
    <div className='flex h-full flex-col justify-between'>
      <div className='overflow-y-auto'>
        <div className='flex flex-1 flex-col'>
          <h2>Examples</h2>
          <div className=''>
            <p className=''>What should I make for dinner tonight?</p>
            <p className=''>I have an onion, and 2 carrots.</p>
          </div>
        </div>
      </div>
      <Modal closeModal={handleCloseModal} isOpen={isGenRecipeOpen}>
        <SaveGeneratedRecipe recipe={genRecipe} />
      </Modal>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='relative flex w-full items-center'
      >
        <textarea
          {...register('message')}
          placeholder='Generate recipe...'
          className='pr- relative max-h-48 w-full overflow-y-auto bg-slate-800 py-3 pl-3 pr-28 text-slate-300'
        ></textarea>
        <div className='absolute right-1'>
          <Button
            type='submit'
            disabled={!!errors.message}
            isLoading={status === 'loading'}
          >
            Generate
          </Button>
        </div>
      </form>
    </div>
  )
}

function SaveGeneratedRecipe(props: {
  recipe: ReturnType<typeof api.recipes.generate.useMutation>
}) {
  const { status, data } = props.recipe

  if (status === 'error') {
    return <p className=''>Please try again.</p>
  }

  if (status === 'success') {
    return <Form data={data} />
  }

  return <FormSkeleton />
}

function Form({
  data: { description, ingredients, instructions, name }
}: {
  data: GeneratedRecipe
}) {
  const { mutate } = api.recipes.create.useMutation()
  const { handleSubmit, register, getValues } = useForm<FormValues>({
    defaultValues: {
      description,
      ingredients: ingredients.join('\n'),
      instructions: instructions.join('\n\n'),
      name
    }
  })

  const onSubmit = (values: FormValues) => {
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n\n')
    mutate({ ...values, ingredients, instructions })
  }

  const ingredientsRowSize =
    Math.min((getValues('ingredients') || '').split('\n').length, 12) || 5
  const instructionsRowSize =
    Math.min((getValues('instructions') || '').split('\n').length, 12) || 5

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
      <div className='mt-2 flex flex-col gap-5'>
        <div className='flex flex-col'>
          <label htmlFor='name' className='text-sm text-gray-500'>
            Name
          </label>
          <input {...register('name')} className='text-gray-500' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='name' className='text-sm text-gray-500'>
            Description
          </label>
          <input {...register('description')} className='text-gray-500' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className='text-sm text-gray-500'>
            Ingredients
          </label>
          <textarea
            rows={ingredientsRowSize}
            {...register('ingredients')}
            className='max-h-60 resize-none p-2 text-gray-500'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='text-sm text-gray-500'>
            Instructions
          </label>
          <textarea
            rows={instructionsRowSize}
            {...register('instructions')}
            className='resize-none p-2 text-gray-500'
          />
        </div>
      </div>

      <Button type='submit'>Save</Button>
    </form>
  )
}
