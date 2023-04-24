import { ErrorMessage } from '@hookform/error-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../../components/Button'
import { Modal } from '../../../components/Modal'
import { TransitionWrapper } from '../../../components/TransitionWrapper'
import {
  LinkedData,
  ScrapedRecipe
} from '../../../server/helpers/parse-recipe-url'
import { api } from '../../../utils/api'
import { useParseRecipe } from './create-hooks'
import { FormSkeleton } from './Loaders'
import { CreateRecipeParams } from '../../../server/api/routers/recipes'
import { CreateRecipeForm } from '../../../components/CreateRecipeForm'

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

const recipeUrlSchema = z.object({
  url: z.string().url('Enter a valid url that contains a recipe.')
})

type RecipeUrlSchemaType = z.infer<typeof recipeUrlSchema>

export function UploadRecipeUrlForm({
  onSubmit
}: {
  onSubmit(values: RecipeUrlSchemaType): void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RecipeUrlSchemaType>({
    resolver: zodResolver(recipeUrlSchema)
  })

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
        <ErrorMessage
          errors={errors}
          name='url'
          render={({ message }) => <p>{message}</p>}
        />
      </div>
      <div className='mt-4'>
        <Button type='submit'>Upload</Button>
      </div>
    </form>
  )
}

export type FormValues = {
  name: string
  description: string
  instructions: string
  ingredients: string
}

export function CreateRecipe({
  data,
  isError,
  isSuccess,

  closeModal
}: {
  data: ScrapedRecipe | undefined
  isError: boolean
  isSuccess: boolean
  closeModal: () => void
}) {
  if (isError) {
    return <p className=''>Oops, something went wrong</p>
  }

  if (isSuccess && data) {
    if (data.parsingType === 'linkedData') {
      return <CreateRecipeSuccess closeModal={closeModal} data={data} />
    } else return <p>Oops something went wrong</p>
  }

  return <FormSkeleton />
}

function CreateRecipeSuccess({
  data,
  closeModal
}: {
  data: LinkedData
  closeModal: () => void
}) {
  const util = api.useContext()

  const form = useForm<FormValues>({
    defaultValues: {
      description: data.description || '',
      name: data.name || data.headline || '',
      ingredients: data.recipeIngredient?.join('\n') || '',
      instructions: data.recipeInstructions?.map((i) => i.text).join('\n') || ''
    }
  })

  const { mutate, isLoading } = api.recipes.create.useMutation({
    onSuccess: async () => {
      util.recipes.entity.invalidate()
      closeModal()
    }
  })

  const onSubmit = (values: FormValues) => {
    const params: CreateRecipeParams = {
      ...values,
      ingredients: values.ingredients.split('\n'),
      instructions: values.instructions.split('\n')
    }
    mutate(params)
  }

  return (
    <CreateRecipeForm
      form={form}
      onSubmit={onSubmit}
      slot={
        <div className='mt-4'>
          <Button isLoading={isLoading} type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    />
  )
}
