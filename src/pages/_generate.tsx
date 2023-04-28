import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../utils/api'
import { Button } from '../components/Button'
import { MouseEvent, useState } from 'react'
import { Modal } from '../components/Modal'
import { FormSkeleton } from '../components/FormSkeleton'
import { GeneratedRecipe } from '../server/api/routers/recipes'
import { zodResolver } from '@hookform/resolvers/zod'

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
    formState: { isDirty, isValid },
    setValue,
    clearErrors
  } = useForm<GenerateRecipeParams>({
    resolver: zodResolver(generateRecipeFormSchema)
  })

  const onSubmit = async (values: GenerateRecipeParams) => {
    setIsGenRecipeOpen(true)
    genRecipe.mutate(values)
  }

  const handleCloseModal = () => {
    setIsGenRecipeOpen(false)
  }

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setValue('message', e.currentTarget.innerText.toLowerCase(), {
      shouldValidate: true,
      shouldDirty: true
    })
    clearErrors()
  }

  return (
    <div className='flex h-full flex-col justify-between'>
      <div className='prose flex flex-col items-center justify-center overflow-y-auto px-4'>
        <h1>RecipeBot</h1>
        <div className='flex flex-1 flex-col items-center justify-center'>
          <h2>Examples</h2>
          <div className='flex flex-col items-center gap-4'>
            <Button onClick={handleFillMessage}>
              What should I make for dinner tonight?
            </Button>
            <Button onClick={handleFillMessage}>
              Which salad recipe will go well with my steak and potatoes?
            </Button>
            <Button onClick={handleFillMessage}>
              What&apos;s a the best risotto recipe?
            </Button>
          </div>
        </div>
      </div>
      <Modal closeModal={handleCloseModal} isOpen={isGenRecipeOpen}>
        <SaveGeneratedRecipe recipe={genRecipe} />
      </Modal>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex w-full items-center'
      >
        <div className='mb-1 w-full px-4'>
          <textarea
            {...register('message')}
            placeholder='Generate recipe...'
            className='input relative w-full resize-none pt-2'
          />
        </div>
        <div className=''>
          <Button
            isLoading={genRecipe.isLoading}
            type='submit'
            disabled={!isValid || !isDirty}
            className='mb-1'
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
          <label htmlFor='name' className=''>
            Name
          </label>
          <input {...register('name')} className='' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='name' className=''>
            Description
          </label>
          <input {...register('description')} className='' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className=''>
            Ingredients
          </label>
          <textarea
            rows={ingredientsRowSize}
            {...register('ingredients')}
            className='max-h-60 resize-none p-2 '
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className=''>
            Instructions
          </label>
          <textarea
            rows={instructionsRowSize}
            {...register('instructions')}
            className='resize-none p-2 '
          />
        </div>
      </div>

      <Button type='submit'>Save</Button>
    </form>
  )
}
