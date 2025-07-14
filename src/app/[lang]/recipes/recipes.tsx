'use client'

import { type Recipe } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useDebounce, {
  useCreateRecipe,
  useParseRecipe
} from '~/hooks/use-recipe'
import { Button } from '~/components/button'
import { Modal } from '~/components/modal'
import { FormLoader } from '~/components/loaders/form'
import { DialogTitle } from '@headlessui/react'
import { type LinkedDataRecipeField } from '~/server/api/schemas/recipes'
import {
  type ChangeEvent,
  Fragment,
  type RefObject,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  MagnifyingGlassCircleIcon,
  PlusIcon,
  XCircleIcon
} from '~/components/icons'
import { LoadingSpinner, ScreenLoader } from '~/components/loaders/screen'
import { api } from '~/trpc/react'
import { useInView } from 'react-intersection-observer'
import { type FetchStatus, type QueryStatus } from '@tanstack/react-query'
import { RecentRecipes } from '~/components/recipe-list-recent'
import { useTranslations } from '~/hooks/use-translations'
import { ErrorMessage } from '~/components/error-message-content'
import { recipeUrlSchema, type RecipeUrlSchemaType } from '~/schemas/recipes'
import { RecipeFallbackIcon } from '~/components/icons'

export default function Recipes() {
  const { ref: inViewRef, inView } = useInView()

  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search)
  const [{ pages }, { fetchNextPage, status, hasNextPage, fetchStatus }] =
    api.recipes.infiniteRecipes.useSuspenseInfiniteQuery(
      {
        limit: 10,
        search: debouncedSearch
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
    )

  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const handleSearchButtonClick = !!search
    ? () => setSearch('')
    : () => inputRef.current?.focus()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])

  return (
    <SearchBarWrapper
      handleChange={handleChange}
      handleSearchButtonClick={handleSearchButtonClick}
      inputRef={inputRef}
      search={search}
    >
      <Pages
        pages={pages}
        search={search}
        status={status}
        fetchStatus={fetchStatus}
      />

      <span ref={inViewRef}></span>
    </SearchBarWrapper>
  )
}

function SearchBarWrapper({
  children,
  handleChange,
  inputRef,
  search,
  handleSearchButtonClick
}: {
  children: React.ReactNode
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLInputElement | null>
  search: string
  handleSearchButtonClick: () => void
}) {
  return (
    <div className='relative container mx-auto flex flex-col overflow-y-auto px-2 pt-16'>
      <SearchBar
        handleChange={handleChange}
        handleSearchButtonClick={handleSearchButtonClick}
        inputRef={inputRef}
        search={search}
      />
      {children}
    </div>
  )
}

function SearchBar({
  inputRef,
  search,
  handleSearchButtonClick,
  handleChange
}: {
  inputRef: RefObject<HTMLInputElement | null>
  search: string
  handleSearchButtonClick: () => void
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const t = useTranslations()

  return (
    <div className='fixed bottom-0 left-0 flex w-full items-center md:rounded-md'>
      <div className='prose bg-base-300/75 mx-auto flex w-full items-center py-1 sm:mb-2 sm:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <input
            type='text'
            className='input input-bordered bg-base-100/75 focus:bg-base-100 w-full'
            value={search}
            onChange={handleChange}
            placeholder={t.recipes.search}
            ref={inputRef}
          />
        </div>
        <div className='pr-2'>
          <button
            type='button'
            onClick={handleSearchButtonClick}
            className='btn btn-square btn-success'
          >
            {!!search ? <XCircleIcon /> : <MagnifyingGlassCircleIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

function Pages({
  search,
  pages,
  status,
  fetchStatus
}: {
  pages: {
    items: Recipe[]
    nextCursor: string | undefined
  }[]
  search: string
  status: QueryStatus
  fetchStatus: FetchStatus
}) {
  const t = useTranslations()

  if (status === 'pending') {
    return <ScreenLoader />
  }

  return (
    <div className='mx-auto grid max-w-4xl grid-cols-2 gap-5 pt-4 pb-20 sm:grid-cols-4'>
      {pages.length > 0 && pages[0].items.length > 0 ? (
        <>
          <RecentRecipes />
        </>
      ) : null}
      <div className='col-span-2 flex h-10 items-center justify-between sm:col-span-4'>
        <h2 className='prose'>{t.recipes.your}</h2>
        {!search && <CreateRecipeButton />}
      </div>

      {pages.map((page, i) => (
        <Fragment key={i}>
          {page.items.length > 0 ? (
            <Cards data={page.items} search={search} />
          ) : (
            <div className='prose col-span-2 sm:col-span-4'>
              <p>
                {t.recipes.noRecipes.message}
                <Link className='link' href='/chat'>
                  {t.recipes.noRecipes.link}
                </Link>
              </p>
            </div>
          )}
        </Fragment>
      ))}

      {fetchStatus === 'fetching' && (
        <div className='col-span-2 mt-4 flex justify-center sm:col-span-4'>
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}

function Cards({ data, search }: { data: Recipe[]; search: string }) {
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

  return (
    <>
      {sortedData.map((recipe) => (
        <Card key={recipe.id} data={recipe} />
      ))}
    </>
  )
}

function Card({ data }: { data: Recipe }) {
  const { mutate } = api.recipes.updateLastViewedAt.useMutation()

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

  const handleUpdateLastViewedAt = () => {
    mutate(data.id)
  }

  return (
    <Link
      href={`/recipes/${data.id}?name=${encodeURIComponent(data.name)}`}
      key={data.id}
      className='bg-base-200 col-span-1 overflow-hidden rounded-lg shadow-xl'
      onClick={handleUpdateLastViewedAt}
    >
      <div className='w-full'>
        {data.imgUrl ? (
          <div className='w-full'>
            <div className='relative h-36'>
              <Image
                className='object-fill sm:object-contain'
                src={data.imgUrl}
                alt='recipe'
                fill
                sizes='(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 33vw'
              />
            </div>
          </div>
        ) : (
          <div className='bg-primary-content'>
            <RecipeFallbackIcon />
          </div>
        )}
      </div>
      <div className='flex flex-col p-3'>
        {address}
        {author}
        <h3 className='text-xl font-bold'>{data.name}</h3>
      </div>
    </Link>
  )
}

function CreateRecipeButton() {
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
    modalContent = <FormLoader />
  }

  if (status === 'success' && data) {
    modalContent = <CreateRecipe data={data} closeModal={closeModal} />
  }

  return (
    <>
      <Button
        type='button'
        onClick={openModal}
        className='btn btn-circle btn-outline'
      >
        <PlusIcon size={6} />
      </Button>
      <Modal closeModal={closeModal} isOpen={isOpen}>
        {modalContent}
      </Modal>
    </>
  )
}

function UploadRecipeUrlForm({
  onSubmit
}: {
  onSubmit(values: RecipeUrlSchemaType): void
}) {
  const t = useTranslations()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RecipeUrlSchemaType>({
    resolver: zodResolver(recipeUrlSchema(t))
  })

  return (
    <>
      <DialogTitle as='h3' className='mt-0'>
        {t.recipes.url}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} className=''>
        <div className='prose mt-2 flex flex-col gap-1'>
          <label htmlFor='url' className='label'>
            <span className='label-text'>{t.recipes.paste}</span>
          </label>
          <input
            {...register('url')}
            className='input input-bordered select-auto'
            autoFocus
          />
          <ErrorMessage errors={errors} name='url' />
        </div>
        <div className='mt-4'>
          <Button className='btn btn-primary w-full' type='submit'>
            {t.recipes.name}
          </Button>
        </div>
      </form>
    </>
  )
}

function CreateRecipe({
  data,
  closeModal
}: {
  data: LinkedDataRecipeField
  closeModal: () => void
}) {
  const t = useTranslations()

  const { handleSubmit, getValues, register, onSubmit, isSuccess, isLoading } =
    useCreateRecipe(data)

  const ingredientsRowSize = (getValues('ingredients') || '').split('\n').length
  const instructionsRowSize = (getValues('instructions') || '').split(
    '\n'
  ).length

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
      <div className='mt-2 flex max-h-[38rem] flex-col gap-5 overflow-y-auto px-1 pb-1'>
        <div className='flex flex-col'>
          <label htmlFor='name' className='label'>
            <span className='label-text'>{t.recipes.name}</span>
          </label>
          <input
            id='name'
            {...register('name')}
            className='input input-bordered'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>{t.recipes.description}</span>
          </label>
          <input
            id='description'
            {...register('description')}
            className='input input-bordered'
          />
        </div>

        <div className='flex gap-2'>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='prepTime' className='label'>
              <span className='label-text'>{t.recipes.prepTime}</span>
            </label>
            <input
              id='prepTime'
              type='text'
              className='input input-bordered input-sm'
              {...register('prepTime')}
            />
          </div>
          <div className='flex w-1/2 flex-col'>
            <label htmlFor='cookTime' className='label'>
              <span className='label-text'>{t.recipes.cookTime}</span>
            </label>
            <input
              id='cookTime'
              type='text'
              className='input input-bordered input-sm pr-2'
              {...register('cookTime')}
            />
          </div>
        </div>
        <div className='flex flex-col'>
          <label htmlFor='ingredients' className='label'>
            <span className='label-text'>{t.recipes.ingredients}</span>
          </label>
          <textarea
            id='ingredients'
            rows={ingredientsRowSize}
            {...register('ingredients')}
            className='textarea textarea-bordered resize-none'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='instructions' className='label'>
            <span className='label-text'>{t.recipes.instructions}</span>
          </label>
          <textarea
            id='instructions'
            rows={instructionsRowSize}
            {...register('instructions')}
            className='textarea textarea-bordered resize-none'
          />
        </div>
      </div>
      <div className='flex w-full gap-1 px-2 py-2'>
        {isSuccess ? (
          <Button className='btn btn-ghost w-1/2' onClick={closeModal}>
            Return
          </Button>
        ) : (
          <>
            <Button
              type='button'
              onClick={closeModal}
              className='btn btn-ghost w-1/2'
            >
              {t.recipes.cancel}
            </Button>
            <Button
              isLoading={isLoading}
              className='btn btn-primary w-1/2'
              type='submit'
            >
              {t.recipes.save}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
