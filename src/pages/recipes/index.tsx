import { Recipe } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import defaultRecipeJpeg from 'assets/default-recipe.jpeg'
import { useForm } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCreateRecipe,
  useParseRecipe,
  useRecipeEntity
} from 'hooks/recipeHooks'
import { Button } from 'components/Button'
import { Modal } from 'components/Modal'
import { FormSkeleton } from 'components/FormSkeleton'
import { CreateRecipeForm } from 'components/CreateRecipeForm'
import { MyHead } from 'components/Head'
import { Dialog } from '@headlessui/react'
import {
  CreateRecipe,
  LinkedDataRecipeField
} from 'server/api/routers/recipe/interface'
import { ChangeEvent, useRef, useState } from 'react'
import { MagnifyingGlassCircleIcon, XCircleIcon } from 'components/Icons'
import { FormValues } from 'pages/chat'

export default function RecipesView() {
  return (
    <>
      <MyHead title='Listy - Recipes' />
      <ListRecent />
    </>
  )
}

export function ListRecent() {
  const { data, isSuccess } = useRecipeEntity()
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  if (isSuccess) {
    return (
      <div className='container mx-auto h-full px-2'>
        <div className='join mt-2 w-full'>
          <input
            type='text'
            className='input-bordered input input-sm join-item w-full'
            value={search}
            onChange={handleChange}
            placeholder='Search...'
            ref={inputRef}
          />
          <button
            type='button'
            onClick={() =>
              !!search ? setSearch('') : inputRef.current?.focus()
            }
            className='btn-sm join-item btn rounded-r-full'
          >
            {!!search ? <XCircleIcon /> : <MagnifyingGlassCircleIcon />}
          </button>
        </div>
        {/* <div className='join'>
          <input
            className='input-bordered input join-item'
            placeholder='Email'
          />
          <button className='join-item btn rounded-r-full'>Subscribe</button>
        </div> */}
        <div className='mt-4 grid grid-cols-2 gap-5 pb-8 md:grid-cols-4'>
          <CardList data={Object.values(data)} search={search} />
        </div>
      </div>
    )
  }
  return <p>Loading...</p>
}

function CardList({ data, search }: { data: Recipe[]; search: string }) {
  let sortedData = data.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })

  if (search) {
    sortedData = sortedData.filter((recipe) =>
      recipe.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (sortedData.length === 0) {
    return <p>No recipes found</p>
  }

  return (
    <>
      {!search && <CreateRecipeCard key='create-recipe-card' />}
      {sortedData.map((recipe) => (
        <Card key={recipe.id} data={recipe} />
      ))}
    </>
  )
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
      <CreateRecipeDialog />
    </div>
  )
}

function CreateRecipeDialog() {
  const { isOpen, status, data, openModal, closeModal, onSubmitUrl } =
    useParseRecipe()

  let modalContent = <UploadRecipeUrlForm onSubmit={onSubmitUrl} />

  if (status === 'error') {
    modalContent = (
      <progress
        className='progress progress-error w-full'
        value='100'
        max='100'
      ></progress>
    )
  }

  if (status === 'success') {
    modalContent = <FormSkeleton />
  }

  if (status === 'success' && data) {
    modalContent = <CreateRecipe data={data} />
  }

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
        {/* <TransitionWrapper currentStep={currentStep} steps={steps} /> */}

        {modalContent}
      </Modal>
    </>
  )
}

const recipeUrlSchema = z.object({
  url: z.string().url('Enter a valid url that contains a recipe.')
})

export type RecipeUrlSchemaType = z.infer<typeof recipeUrlSchema>

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
    <>
      <Dialog.Title as='h3' className='mt-0'>
        Paste a recipe from the web
      </Dialog.Title>
      <form onSubmit={handleSubmit(onSubmit)} className=''>
        <div className='prose mt-2 flex flex-col gap-1'>
          <label htmlFor='url' className='label'>
            <span className='label-text'>Recipe URL</span>
          </label>
          <input {...register('url')} className='input select-auto' autoFocus />
          <ErrorMessage
            errors={errors}
            name='url'
            render={({ message }) => <p className='text-error'>{message}</p>}
          />
        </div>
        <div className='mt-4'>
          <Button className='btn-primary btn w-full' type='submit'>
            Upload
          </Button>
        </div>
      </form>
    </>
  )
}

function CreateRecipe({ data }: { data: LinkedDataRecipeField }) {
  const form = useForm<FormValues>({
    defaultValues: {
      description: data.description || '',
      name: data.name || data.headline || '',
      ingredients: data.recipeIngredient?.join('\n') || '',
      instructions:
        data.recipeInstructions?.map((i) => i.text)?.join('\n') || '',
      cookTime: data?.cookTime || '',
      prepTime: data?.prepTime || ''
    }
  })

  const { mutate, isLoading } = useCreateRecipe()

  const onSubmit = (values: FormValues) => {
    const params: CreateRecipe = {
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
          <Button
            className='btn-primary btn w-full'
            isLoading={isLoading}
            type='submit'
          >
            Save
          </Button>
        </div>
      }
    />
  )
}
