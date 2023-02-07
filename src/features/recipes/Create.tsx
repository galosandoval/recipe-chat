import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import {
  Step,
  TotalSteps,
  TransitionWrapper
} from '../../components/TransitionWrapper'
import { PartialLD } from '../../server/helpers/parse-recipe-url'
import { trpc } from '../../utils/trpc'

function useParseRecipeOnClient() {
  const [data, setData] = useState<PartialLD>({})
  const [status, setStatus] = useState<
    'idle' | 'failed' | 'loading' | 'success'
  >('idle')

  async function fetchRecipe(url: string) {
    try {
      setStatus('loading')

      const response = await fetch(url)
      console.log('false')

      const html = await response.text()

      let openScriptIdx = 0
      let closeScriptIdx = 0
      let foundLinkedData = false
      for (let i = 0; i < html.length - 4; i++) {
        const char1 = html[i]
        const char2 = html[i + 1]
        const char3 = html[i + 2]
        const char4 = html[i + 3]
        const char5 = html[i + 4]

        if (
          char1 === 'l' &&
          char2 === 'd' &&
          char3 === '+' &&
          char4 === 'j' &&
          char5 === 's'
        ) {
          foundLinkedData = true
          openScriptIdx = i + 9
        } else if (
          foundLinkedData &&
          char1 === '<' &&
          char2 === '/' &&
          char3 === 's' &&
          char4 === 'c' &&
          char5 === 'r'
        ) {
          closeScriptIdx = i
          break
        }
      }

      setData(
        JSON.parse(html.slice(openScriptIdx, closeScriptIdx)) as PartialLD
      )
      setStatus('success')
      return true
    } catch (error) {
      setStatus('failed')
      return false
    }
  }

  return { fetchRecipe, data, status }
}

function useParseRecipe() {
  const {
    data: parsedDataOnClient,
    fetchRecipe,
    status
  } = useParseRecipeOnClient()
  const parseRecipeOnServer = trpc.parseRecipeUrl.useMutation({})

  let data: Partial<PartialLD> = parsedDataOnClient
  if (parseRecipeOnServer.status === 'success') {
    data = parseRecipeOnServer.data
  }

  const isError = parseRecipeOnServer.status === 'error'
  const isSuccess =
    status === 'success' || parseRecipeOnServer.status === 'success'

  const steps: TotalSteps = {
    first: {
      key: 'first',
      next: 'second',
      prev: null,
      component: (
        <>
          <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
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
          <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
            Upload a recipe
          </Dialog.Title>
          <CreateRecipe
            closeModal={closeModal}
            data={data || {}}
            isError={isError}
            isSuccess={isSuccess}
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

  async function onSubmitUrl({ url }: { url: string }) {
    const IsSuccessOnClient = await fetchRecipe(url)

    console.log('status', IsSuccessOnClient)
    if (!IsSuccessOnClient) {
      console.log('is mutating')
      parseRecipeOnServer.mutate(url)
    }

    nextStep()
  }

  return { isOpen, steps, currentStep, openModal, closeModal }
}

export function CreateRecipePopover() {
  const { isOpen, steps, currentStep, openModal, closeModal } = useParseRecipe()

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
          className='select-auto bg-white text-gray-500 dark:bg-slate-400'
          autoFocus
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
  data: PartialLD
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
  data: PartialLD
  closeModal: () => void
}) {
  const util = trpc.useContext()

  const { register, handleSubmit, getValues } = useForm<FormValues>({
    defaultValues: {
      description: data.description || '',
      name: data.name || data.headline || '',
      ingredients: data.recipeIngredient?.join('\n') || '',
      instructions: data.recipeInstructions?.map((i) => i.text).join('\n') || ''
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
      <div className='mt-2 flex flex-col gap-5'>
        <div className='flex flex-col'>
          <label htmlFor='name' className='text-sm text-gray-500'>
            Title
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
            rows={(getValues('ingredients') || '').split('\n').length || 5}
            {...register('ingredients')}
            className='max-h-60 resize-none p-2 text-gray-500'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='text-sm text-gray-500'>
            Instructions
          </label>
          <textarea
            rows={(getValues('instructions') || '').split('\n').length || 5}
            {...register('instructions')}
            className='resize-none p-2 text-gray-500'
          />
        </div>
      </div>

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
    <div className='mt-2 flex animate-pulse flex-col'>
      <label className='text-sm text-gray-600'>Title</label>
      <div className='h-4 w-52 rounded bg-slate-200 dark:bg-gray-600'></div>
      <label className='text-sm text-gray-600'>Description</label>
      <div className='h-4 w-full rounded bg-slate-200 dark:bg-gray-600'></div>
      <label className='text-sm text-gray-600'>Ingredients</label>
      <div className='flex flex-col gap-3'>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
      </div>
      <label className='text-sm text-gray-600'>Instructions</label>
      <div className='flex flex-col gap-3'>
        <div className='h-5 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
      </div>
    </div>
  )
}
