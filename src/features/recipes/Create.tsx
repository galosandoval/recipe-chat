import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { Modal } from '../../components/Modal'
import {
  Step,
  TotalSteps,
  TransitionWrapper
} from '../../components/TransitionWrapper'
import { Button } from '../../components/Button'
import { useForm } from 'react-hook-form'
import { trpc } from '../../utils/trpc'
import { ParsedRecipe } from '../../utils/parse-recipe-url'

export function CreateRecipePopover() {
  const parsedRecipe = trpc.parseRecipeUrl.useMutation()
  const steps: TotalSteps = {
    first: {
      key: 'first',
      next: 'second',
      prev: null,
      component: (
        <>
          <Dialog.Title
            as='h3'
            className='text-lg font-medium leading-6 text-gray-900'
          >
            Upload a recipe
          </Dialog.Title>
          <UploadRecipeUrlForm onSubmit={onSubmitUrl} />
        </>
      )
    },
    second: {
      key: 'second',
      next: null,
      prev: 'first',
      component: (
        <>
          <Dialog.Title
            as='h3'
            className='text-lg font-medium leading-6 text-gray-900'
          >
            Upload a recipe
          </Dialog.Title>
          <CreateRecipe
            closeModal={closeModal}
            data={
              parsedRecipe.data || {
                descriptions: [],
                ingredients: [],
                instructions: [],
                names: []
              }
            }
            isError={parsedRecipe.isError}
            isSuccess={parsedRecipe.isSuccess}
          />
        </>
      )
    }
  } as const
  const [isOpen, setIsOpen] = useState(false)

  const [currentStep, setCurrentStep] = useState<Step | undefined>(steps.first)

  function closeModal() {
    setIsOpen(false)
    setTimeout(() => {
      // to show UI change after closing modal
      setCurrentStep(steps.first)
    }, 200)
  }

  function openModal() {
    setIsOpen(true)
  }

  function nextStep() {
    setCurrentStep((state) => steps[state?.next as keyof typeof steps])
  }

  function onSubmitUrl(values: { url: string }) {
    parsedRecipe.mutate(values.url)
    nextStep()
  }

  return (
    <>
      <div className='flex items-center justify-center'>
        <button
          type='button'
          onClick={openModal}
          className='rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'
        >
          Create from website
        </button>
      </div>
      <Modal closeModal={closeModal} isOpen={isOpen}>
        <TransitionWrapper currentStep={currentStep} steps={steps} />
      </Modal>
    </>
  )
}

function UploadRecipeUrlForm({
  onSubmit
}: {
  onSubmit(values: { url: string }): void
}) {
  const { register, handleSubmit } = useForm<{ url: string }>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=''>
      <div className='mt-2 flex flex-col gap-1'>
        <label htmlFor='url' className='text-sm text-gray-500'>
          Recipe URL
        </label>
        <input
          {...register('url')}
          className='text-gray-500'
          defaultValue='https://www.bbcgoodfood.com/recipes/spiced-carrot-lentil-soup'
        />
      </div>
      <div className='mt-4'>
        <Button props={{ type: 'submit' }}>Upload</Button>
      </div>
    </form>
  )
}

type FormValues = {
  name: string
  description: string
  instructions: string
  ingredients: string
}

function CreateRecipe({
  data,
  isError,
  isSuccess,

  closeModal
}: {
  data: ParsedRecipe
  isError: boolean
  isSuccess: boolean
  closeModal: () => void
}) {
  if (isError) {
    return <p className=''>Oops, something went wrong</p>
  }

  if (isSuccess) {
    return <CreateRecipeForm closeModal={closeModal} data={data} />
  }

  return <FormSkeleton />
}

function CreateRecipeForm({
  data,
  closeModal
}: {
  data: ParsedRecipe
  closeModal: () => void
}) {
  const util = trpc.useContext()
  const [ingredientsPage, setIngredientsPage] = useState(0)
  const [instructionsPage, setInstructionsPage] = useState(0)

  const { register, handleSubmit, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      description: data.descriptions[0],
      name: data.names[0],
      ingredients: data.ingredients[0].join('\n'),
      instructions: data.instructions[0].join('\n')
    }
  })

  const { mutate, isLoading } = trpc.recipeCreate.useMutation({
    onSuccess: async () => {
      util.recipeEntity.invalidate({ userId: 1 })
      closeModal()
    }
  })

  const onSubmit = (values: FormValues) => {
    const params = {
      ...values,
      // TODO: do not hardcode
      userId: 1,
      ingredients: values.ingredients.split('\n'),
      instructions: values.instructions.split('\n')
    }
    mutate(params)
  }

  const changeIngredientsPage = () => {
    const ingredientsLength = data.ingredients.length
    const newState = (ingredientsPage + 1) & ingredientsLength
    setValue('ingredients', data.ingredients[newState].join('\n'))
    setIngredientsPage(newState)
  }

  const changeInstructionsPage = () => {
    const instructionsLength = data.instructions.length
    const newState = (instructionsPage + 1) & instructionsLength
    setValue('instructions', data.instructions[newState].join('\n'))
    setInstructionsPage(newState)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
      <div className='mt-2 flex flex-col'>
        <label htmlFor='name' className='text-sm text-gray-500'>
          Title
        </label>
        <input {...register('name')} className='text-gray-500' />
        <label htmlFor='name' className='text-sm text-gray-500'>
          Description
        </label>
        <input {...register('description')} className='text-gray-500' />
        <label htmlFor='ingredients' className='text-sm text-gray-500'>
          Ingredients
        </label>
        <textarea
          rows={(getValues('ingredients') || '').split('\n').length || 5}
          {...register('ingredients')}
          className='text-gray-500 resize-none p-2 max-h-60'
        />
        <label htmlFor='instructions' className='text-sm text-gray-500'>
          Instructions
        </label>
        <textarea
          rows={(getValues('instructions') || '').split('\n').length || 5}
          {...register('instructions')}
          className='text-gray-500 resize-none p-2 max-h-60'
        />
      </div>
      <Button props={{ type: 'button' }} onClick={changeIngredientsPage}>
        Next ingredients
      </Button>
      <Button props={{ type: 'button' }} onClick={changeInstructionsPage}>
        Next instructions
      </Button>
      <div className='mt-4'>
        <Button
          props={{ type: 'submit', disabled: isLoading }}
          isLoading={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

function FormSkeleton() {
  return (
    <div className='mt-2 flex flex-col'>
      <label className='text-sm text-gray-600'>Title</label>
      <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-52'></div>
      <label className='text-sm text-gray-600'>Description</label>
      <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-full'></div>
      <label className='text-sm text-gray-600'>Ingredients</label>
      <div className='flex flex-col gap-3'>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
      </div>
      <label className='text-sm text-gray-600'>Instructions</label>
      <div className='flex flex-col gap-3'>
        <div className='h-5 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
        <div className='h-4 bg-slate-200 dark:bg-gray-600 rounded w-1/2'></div>
      </div>
    </div>
  )
}
