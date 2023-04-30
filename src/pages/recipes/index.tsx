import { Recipe } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import defaultRecipeJpeg from 'assets/default-recipe.jpeg'
import { useForm } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParseRecipe, useRecipeEntity } from 'hooks/recipeHooks'
import { Button } from 'components/Button'
import { Modal } from 'components/Modal'
import { TransitionWrapper } from 'components/TransitionWrapper'
import { LinkedData, ScrapedRecipe } from 'server/helpers/parse-recipe-url'
import { FormSkeleton } from 'components/FormSkeleton'
import { api } from 'utils/api'
import { FormValues } from 'pages/_generate'
import { CreateRecipeParams } from 'server/api/routers/recipeRouter'
import { CreateRecipeForm } from 'components/CreateRecipeForm'
import { MyHead } from 'components/Head'

export default function Recipes() {
  return (
    <>
      <MyHead title='Listy - Recipes' />
      <ListRecent />
    </>
  )
}

export function ListRecent() {
  const { data, isSuccess } = useRecipeEntity()

  if (isSuccess) {
    return (
      <div className='container mx-auto h-full px-2'>
        <div className='prose'>
          <h1 className=''>Recent Recipes</h1>
        </div>
        <div className='grid grid-cols-2 gap-5 md:grid-cols-4'>
          <CardList data={Object.values(data)} />
        </div>
      </div>
    )
  }
  return <p>Loading...</p>
}

function CardList({ data }: { data: Recipe[] }) {
  const toReturn: JSX.Element[] = [
    <CreateRecipeCard key='create-recipe-card' />
  ]
  toReturn.push(...data.map((recipe) => <Card key={recipe.id} data={recipe} />))
  return <>{toReturn}</>
}

function Card({ data }: { data: Recipe }) {
  let address: React.ReactNode = null
  if (data.address) {
    address = (
      <a href={data.address} className=''>
        {data.address}
      </a>
    )
  }

  let author: React.ReactNode = null
  if (data.author) {
    author = <p className=''>{data.author}</p>
  }

  return (
    <Link
      href={`/recipes/${data.id}?name=${encodeURIComponent(data.name)}`}
      key={data.id}
      className='card overflow-hidden bg-base-200 shadow-lg'
    >
      <div className='w-full'>
        <Image
          src={data.imgUrl || defaultRecipeJpeg}
          alt='recipe'
          className='image-full'
          priority
        />
      </div>
      <div className='prose card-body flex flex-col'>
        {address}
        {author}
        <h3 className='card-title'>{data.name}</h3>
      </div>
    </Link>
  )
}

function CreateRecipeCard() {
  return (
    <div className='flex flex-col overflow-hidden rounded'>
      <CreateRecipePopover />
    </div>
  )
}

function CreateRecipePopover() {
  const { isOpen, steps, currentStep, openModal, closeModal } = useParseRecipe()

  return (
    <>
      <div className='card flex h-full items-center justify-center overflow-hidden'>
        <Button
          type='button'
          onClick={openModal}
          className='btn-accent btn h-full'
        >
          Create from website
        </Button>
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
      <div className='prose mt-2 flex flex-col gap-1'>
        <label htmlFor='url' className='label'>
          <span className='label-text'>Recipe URL</span>
        </label>
        <input {...register('url')} className='input select-auto' autoFocus />
        <ErrorMessage
          errors={errors}
          name='url'
          render={({ message }) => <p>{message}</p>}
        />
      </div>
      <div className='mt-4'>
        <Button className='btn-primary btn w-full' type='submit'>
          Upload
        </Button>
      </div>
    </form>
  )
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

  const { mutate, isLoading } = api.recipe.create.useMutation({
    onSuccess: async () => {
      util.recipe.entity.invalidate()
      closeModal()
    }
  })

  const onSubmit = (values: FormValues) => {
    const params: CreateRecipeParams = {
      ...values,
      ingredients: values.ingredients.split('\n'),
      instructions: values.instructions.split('\n\n')
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
            Save
          </Button>
        </div>
      }
    />
  )
}
