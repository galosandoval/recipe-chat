import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { MouseEvent, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { Button } from 'components/Button'
import { Modal } from 'components/Modal'
import { api } from 'utils/api'
import { FormSkeleton } from 'components/FormSkeleton'
import { GeneratedRecipe } from 'server/api/routers/recipe/interface'

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

type Message = {
  from: 'me' | 'chat'
  value: string
  timeStamp: string
}

export default function GenerateRecipe() {
  const utils = api.useContext()
  utils.recipe.entity.prefetch()

  const [isGenRecipeOpen, setIsGenRecipeOpen] = useState(false)
  const [enableCloseModal, setEnableCloseModal] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const genRecipe = api.recipe.generate.useMutation()

  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid },
    setValue,
    reset,
    clearErrors
  } = useForm<GenerateRecipeParams>({
    resolver: zodResolver(generateRecipeFormSchema)
  })

  const addMessage = (values: GenerateRecipeParams) => {
    setMessages((state) => [
      ...state,
      { from: 'me', timeStamp: new Date().toISOString(), value: values.message }
    ])
    reset()

    setTimeout(() => {
      setMessages((state) => [
        ...state,
        {
          from: 'chat',
          timeStamp: new Date().toISOString(),
          value: 'Generating your recipe...'
        }
      ])
    }, 500)
  }

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

  const handleEnableCloseModal = () => {
    setEnableCloseModal(true)
  }

  return (
    <>
      <div className='relative flex flex-col'>
        <div className='prose flex flex-col items-center justify-center overflow-y-auto px-4 pb-16'>
          <h1>RecipeBot</h1>
          <div className='flex flex-1 flex-col items-center justify-center'>
            <h2>Examples</h2>
            <div className='flex flex-col items-center gap-4'>
              <Button className='btn-primary btn' onClick={handleFillMessage}>
                What should I make for dinner tonight?
              </Button>
              <Button className='btn-primary btn' onClick={handleFillMessage}>
                Which salad recipe will go well with my steak and potatoes?
              </Button>
              <Button className='btn-primary btn' onClick={handleFillMessage}>
                What&apos;s a the best risotto recipe?
              </Button>
            </div>
          </div>
        </div>

        {messages.length ? (
          <div className='flex flex-col'>
            {messages.map((m) => {
              if (m.from === 'me') {
                return (
                  <p
                    className='chat-bubble chat-bubble-primary ml-auto'
                    key={m.timeStamp}
                  >
                    {m.value}
                  </p>
                )
              }
              return (
                <p className='chat-bubble mr-auto' key={m.timeStamp}>
                  {m.value}
                </p>
              )
            })}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit(addMessage)}
          className='fixed bottom-0 flex w-full items-center bg-base-100'
        >
          <div className='w-full px-2'>
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
              className='btn-accent btn mb-1'
            >
              Generate
            </Button>
          </div>
        </form>
      </div>

      <Modal
        closeModal={
          enableCloseModal
            ? handleCloseModal
            : () => {
                return
              }
        }
        isOpen={isGenRecipeOpen}
      >
        <SaveGeneratedRecipe
          handleEnableCloseModal={handleEnableCloseModal}
          handleCloseModal={handleCloseModal}
          recipe={genRecipe}
        />
      </Modal>
    </>
  )
}

function SaveGeneratedRecipe(props: {
  recipe: ReturnType<typeof api.recipe.generate.useMutation>
  handleEnableCloseModal: () => void
  handleCloseModal: () => void
}) {
  const { status, data } = props.recipe

  if (status === 'error') {
    props.handleEnableCloseModal()
    return <p className=''>Please try again.</p>
  }

  if (status === 'success') {
    props.handleEnableCloseModal()
    return <Form handleCloseModal={props.handleCloseModal} data={data} />
  }

  return <FormSkeleton />
}

function Form({
  data: { description, ingredients, instructions, name, cookTime, prepTime },
  handleCloseModal
}: {
  data: GeneratedRecipe
  handleCloseModal: () => void
}) {
  const router = useRouter()
  const { mutate, isLoading, isSuccess } = api.recipe.create.useMutation({
    onSuccess: (data) => {
      router.push(`recipes/${data.id}?name=${encodeURIComponent(data.name)}`)
    }
  })
  const { handleSubmit, register, getValues } = useForm<FormValues>({
    defaultValues: {
      description,
      ingredients: ingredients.join('\n'),
      instructions: instructions.join('\n'),
      name,
      cookTime,
      prepTime
    }
  })

  const onSubmit = (values: FormValues) => {
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n')
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
          <label htmlFor='name' className='label'>
            <span className='label-text'>Name</span>
          </label>
          <input id='name' {...register('name')} className='input' />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>Description</span>
          </label>
          <input
            id='description'
            {...register('description')}
            className='input'
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
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className='label'>
            <span className='label-text'>Ingredients</span>
          </label>
          <textarea
            id='ingredients'
            rows={ingredientsRowSize}
            {...register('ingredients')}
            className='textarea resize-none'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='label'>
            <span className='label-text'>Instructions</span>
          </label>
          <textarea
            id='instructions'
            rows={instructionsRowSize}
            {...register('instructions')}
            className='textarea resize-none'
          />
        </div>
      </div>
      <div className='flex w-full py-2'>
        {isSuccess ? (
          <Button className='btn-ghost btn w-1/2' onClick={handleCloseModal}>
            Return
          </Button>
        ) : (
          <>
            <Button
              type='button'
              onClick={handleCloseModal}
              className='btn-ghost btn w-1/2'
            >
              Cancel
            </Button>
            <Button
              isLoading={isLoading}
              className='btn-primary btn w-1/2'
              type='submit'
            >
              Save
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
