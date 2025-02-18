import { type Recipe } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useDebounce, {
  useCreateRecipe,
  useParseRecipe
} from '~/hooks/use-recipe'
import { Button } from '~/components/button'
import { Modal } from '~/components/modal'
import { FormLoader } from '~/components/loaders/form'
import { MyHead } from '~/components/head'
import { Dialog } from '@headlessui/react'
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
import { api } from '~/utils/api'
import { useInView } from 'react-intersection-observer'
import { type FetchStatus, type QueryStatus } from '@tanstack/react-query'
import { RecentRecipes } from '~/components/recipe-list-recent'
import { type GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from '~/hooks/use-translation'
import { type TFunction } from 'i18next'
import { ErrorMessage } from '~/components/error-message-content'

export const getStaticProps = (async ({ locale }) => {
  const localeFiles = ['common']

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', localeFiles))
      // Will be passed to the page component as props
    }
  }
}) satisfies GetStaticProps

export default function RecipesView() {
  return (
    <>
      <MyHead title='Recipes' />
      <Recipes />
    </>
  )
}

export function Recipes() {
  const { ref: inViewRef, inView } = useInView()

  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search)
  const { data, status, hasNextPage, fetchNextPage, fetchStatus } =
    api.recipes.infiniteRecipes.useInfiniteQuery(
      {
        limit: 8,
        search: debouncedSearch
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        keepPreviousData: true
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

  const pages = data?.pages ?? []

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
  inputRef: RefObject<HTMLInputElement>
  search: string
  handleSearchButtonClick: () => void
}) {
  return (
    <div className='container relative mx-auto flex flex-col overflow-y-auto px-2 pt-16'>
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
  inputRef: RefObject<HTMLInputElement>
  search: string
  handleSearchButtonClick: () => void
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const t = useTranslation()

  return (
    <div className='fixed bottom-0 left-0 flex w-full items-center md:rounded-md'>
      <div className='prose mx-auto flex w-full items-center bg-base-300/75 py-1 sm:mb-2 sm:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <input
            type='text'
            className='input input-bordered w-full bg-base-100/75 focus:bg-base-100'
            value={search}
            onChange={handleChange}
            placeholder={t('recipes.search')}
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
  const t = useTranslation()

  if (status === 'loading') {
    return <ScreenLoader />
  }

  return (
    <div className='mx-auto grid max-w-4xl grid-cols-2 gap-5 pb-20 pt-4 sm:grid-cols-4'>
      {pages.length > 0 && pages[0].items.length > 0 ? (
        <>
          <RecentRecipes />
        </>
      ) : null}
      <div className='col-span-2 flex h-10 items-center justify-between sm:col-span-4'>
        <h2 className='prose'>{t('recipes.your')}</h2>
        {!search && <CreateRecipeButton />}
      </div>

      {pages.map((page, i) => (
        <Fragment key={i}>
          {page.items.length > 0 ? (
            <Cards data={page.items} search={search} />
          ) : (
            <div className='prose col-span-2 sm:col-span-4'>
              <p>
                {t('recipes.no-recipes.message')}
                <Link className='link' href='/chat'>
                  {t('recipes.no-recipes.link')}
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
      className='col-span-1 overflow-hidden rounded-lg bg-base-200 shadow-xl'
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
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='260'
              height='260'
              viewBox='0 0 260 260'
              className='h-36 w-full fill-current'
            >
              <g fillRule='evenodd'>
                <g id='i-like-food' fill='currentColor'>
                  <path d='M24.37 16c.2.65.39 1.32.54 2H21.17l1.17 2.34.45.9-.24.11V28a5 5 0 0 1-2.23 8.94l-.02.06a8 8 0 0 1-7.75 6h-20a8 8 0 0 1-7.74-6l-.02-.06A5 5 0 0 1-17.45 28v-6.76l-.79-1.58-.44-.9.9-.44.63-.32H-20a23.01 23.01 0 0 1 44.37-2zm-36.82 2a1 1 0 0 0-.44.1l-3.1 1.56.89 1.79 1.31-.66a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .86.02l2.88-1.27a3 3 0 0 1 2.43 0l2.88 1.27a1 1 0 0 0 .85-.02l3.1-1.55-.89-1.79-1.42.71a3 3 0 0 1-2.56.06l-2.77-1.23a1 1 0 0 0-.4-.09h-.01a1 1 0 0 0-.4.09l-2.78 1.23a3 3 0 0 1-2.56-.06l-2.3-1.15a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1L.9 19.22a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1l-2.21 1.11a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01zm0-2h-4.9a21.01 21.01 0 0 1 39.61 0h-2.09l-.06-.13-.26.13h-32.31zm30.35 7.68l1.36-.68h1.3v2h-36v-1.15l.34-.17 1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0l1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0L2.26 23h2.59l1.36.68a3 3 0 0 0 2.56.06l1.67-.74h3.23l1.67.74a3 3 0 0 0 2.56-.06zM-13.82 27l16.37 4.91L18.93 27h-32.75zm-.63 2h.34l16.66 5 16.67-5h.33a3 3 0 1 1 0 6h-34a3 3 0 1 1 0-6zm1.35 8a6 6 0 0 0 5.65 4h20a6 6 0 0 0 5.66-4H-13.1z' />
                  <path
                    id='path6_fill-copy'
                    d='M284.37 16c.2.65.39 1.32.54 2H281.17l1.17 2.34.45.9-.24.11V28a5 5 0 0 1-2.23 8.94l-.02.06a8 8 0 0 1-7.75 6h-20a8 8 0 0 1-7.74-6l-.02-.06a5 5 0 0 1-2.24-8.94v-6.76l-.79-1.58-.44-.9.9-.44.63-.32H240a23.01 23.01 0 0 1 44.37-2zm-36.82 2a1 1 0 0 0-.44.1l-3.1 1.56.89 1.79 1.31-.66a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .86.02l2.88-1.27a3 3 0 0 1 2.43 0l2.88 1.27a1 1 0 0 0 .85-.02l3.1-1.55-.89-1.79-1.42.71a3 3 0 0 1-2.56.06l-2.77-1.23a1 1 0 0 0-.4-.09h-.01a1 1 0 0 0-.4.09l-2.78 1.23a3 3 0 0 1-2.56-.06l-2.3-1.15a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1l-2.21 1.11a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1l-2.21 1.11a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01zm0-2h-4.9a21.01 21.01 0 0 1 39.61 0h-2.09l-.06-.13-.26.13h-32.31zm30.35 7.68l1.36-.68h1.3v2h-36v-1.15l.34-.17 1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0l1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0l1.36-.68h2.59l1.36.68a3 3 0 0 0 2.56.06l1.67-.74h3.23l1.67.74a3 3 0 0 0 2.56-.06zM246.18 27l16.37 4.91L278.93 27h-32.75zm-.63 2h.34l16.66 5 16.67-5h.33a3 3 0 1 1 0 6h-34a3 3 0 1 1 0-6zm1.35 8a6 6 0 0 0 5.65 4h20a6 6 0 0 0 5.66-4H246.9z'
                  />
                  <path d='M159.5 21.02A9 9 0 0 0 151 15h-42a9 9 0 0 0-8.5 6.02 6 6 0 0 0 .02 11.96A8.99 8.99 0 0 0 109 45h42a9 9 0 0 0 8.48-12.02 6 6 0 0 0 .02-11.96zM151 17h-42a7 7 0 0 0-6.33 4h54.66a7 7 0 0 0-6.33-4zm-9.34 26a8.98 8.98 0 0 0 3.34-7h-2a7 7 0 0 1-7 7h-4.34a8.98 8.98 0 0 0 3.34-7h-2a7 7 0 0 1-7 7h-4.34a8.98 8.98 0 0 0 3.34-7h-2a7 7 0 0 1-7 7h-7a7 7 0 1 1 0-14h42a7 7 0 1 1 0 14h-9.34zM109 27a9 9 0 0 0-7.48 4H101a4 4 0 1 1 0-8h58a4 4 0 0 1 0 8h-.52a9 9 0 0 0-7.48-4h-42z' />
                  <path d='M39 115a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm6-8a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm-3-29v-2h8v-6H40a4 4 0 0 0-4 4v10H22l-1.33 4-.67 2h2.19L26 130h26l3.81-40H58l-.67-2L56 84H42v-6zm-4-4v10h2V74h8v-2h-8a2 2 0 0 0-2 2zm2 12h14.56l.67 2H22.77l.67-2H40zm13.8 4H24.2l3.62 38h22.36l3.62-38z' />
                  <path d='M129 92h-6v4h-6v4h-6v14h-3l.24 2 3.76 32h36l3.76-32 .24-2h-3v-14h-6v-4h-6v-4h-8zm18 22v-12h-4v4h3v8h1zm-3 0v-6h-4v6h4zm-6 6v-16h-4v19.17c1.6-.7 2.97-1.8 4-3.17zm-6 3.8V100h-4v23.8a10.04 10.04 0 0 0 4 0zm-6-.63V104h-4v16a10.04 10.04 0 0 0 4 3.17zm-6-9.17v-6h-4v6h4zm-6 0v-8h3v-4h-4v12h1zm27-12v-4h-4v4h3v4h1v-4zm-6 0v-8h-4v4h3v4h1zm-6-4v-4h-4v8h1v-4h3zm-6 4v-4h-4v8h1v-4h3zm7 24a12 12 0 0 0 11.83-10h7.92l-3.53 30h-32.44l-3.53-30h7.92A12 12 0 0 0 130 126z' />
                  <path d='M212 86v2h-4v-2h4zm4 0h-2v2h2v-2zm-20 0v.1a5 5 0 0 0-.56 9.65l.06.25 1.12 4.48a2 2 0 0 0 1.94 1.52h.01l7.02 24.55a2 2 0 0 0 1.92 1.45h4.98a2 2 0 0 0 1.92-1.45l7.02-24.55a2 2 0 0 0 1.95-1.52L224.5 96l.06-.25a5 5 0 0 0-.56-9.65V86a14 14 0 0 0-28 0zm4 0h6v2h-9a3 3 0 1 0 0 6H223a3 3 0 1 0 0-6H220v-2h2a12 12 0 1 0-24 0h2zm-1.44 14l-1-4h24.88l-1 4h-22.88zm8.95 26l-6.86-24h18.7l-6.86 24h-4.98zM150 242a22 22 0 1 0 0-44 22 22 0 0 0 0 44zm24-22a24 24 0 1 1-48 0 24 24 0 0 1 48 0zm-28.38 17.73l2.04-.87a6 6 0 0 1 4.68 0l2.04.87a2 2 0 0 0 2.5-.82l1.14-1.9a6 6 0 0 1 3.79-2.75l2.15-.5a2 2 0 0 0 1.54-2.12l-.19-2.2a6 6 0 0 1 1.45-4.46l1.45-1.67a2 2 0 0 0 0-2.62l-1.45-1.67a6 6 0 0 1-1.45-4.46l.2-2.2a2 2 0 0 0-1.55-2.13l-2.15-.5a6 6 0 0 1-3.8-2.75l-1.13-1.9a2 2 0 0 0-2.5-.8l-2.04.86a6 6 0 0 1-4.68 0l-2.04-.87a2 2 0 0 0-2.5.82l-1.14 1.9a6 6 0 0 1-3.79 2.75l-2.15.5a2 2 0 0 0-1.54 2.12l.19 2.2a6 6 0 0 1-1.45 4.46l-1.45 1.67a2 2 0 0 0 0 2.62l1.45 1.67a6 6 0 0 1 1.45 4.46l-.2 2.2a2 2 0 0 0 1.55 2.13l2.15.5a6 6 0 0 1 3.8 2.75l1.13 1.9a2 2 0 0 0 2.5.8zm2.82.97a4 4 0 0 1 3.12 0l2.04.87a4 4 0 0 0 4.99-1.62l1.14-1.9a4 4 0 0 1 2.53-1.84l2.15-.5a4 4 0 0 0 3.09-4.24l-.2-2.2a4 4 0 0 1 .97-2.98l1.45-1.67a4 4 0 0 0 0-5.24l-1.45-1.67a4 4 0 0 1-.97-2.97l.2-2.2a4 4 0 0 0-3.09-4.25l-2.15-.5a4 4 0 0 1-2.53-1.84l-1.14-1.9a4 4 0 0 0-5-1.62l-2.03.87a4 4 0 0 1-3.12 0l-2.04-.87a4 4 0 0 0-4.99 1.62l-1.14 1.9a4 4 0 0 1-2.53 1.84l-2.15.5a4 4 0 0 0-3.09 4.24l.2 2.2a4 4 0 0 1-.97 2.98l-1.45 1.67a4 4 0 0 0 0 5.24l1.45 1.67a4 4 0 0 1 .97 2.97l-.2 2.2a4 4 0 0 0 3.09 4.25l2.15.5a4 4 0 0 1 2.53 1.84l1.14 1.9a4 4 0 0 0 5 1.62l2.03-.87zM152 207a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm6 2a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-11 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-6 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3-5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-8 8a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm0 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5-2a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4-6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm6-4a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4-3a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4-3a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-5-4a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-24 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm16 5a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm7-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0zm86-29a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm19 9a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-14 5a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm-25 1a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm5 4a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm9 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm15 1a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm12-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm-11-14a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-19 0a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm6 5a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-25 15c0-.47.01-.94.03-1.4a5 5 0 0 1-1.7-8 3.99 3.99 0 0 1 1.88-5.18 5 5 0 0 1 3.4-6.22 3 3 0 0 1 1.46-1.05 5 5 0 0 1 7.76-3.27A30.86 30.86 0 0 1 246 184c6.79 0 13.06 2.18 18.17 5.88a5 5 0 0 1 7.76 3.27 3 3 0 0 1 1.47 1.05 5 5 0 0 1 3.4 6.22 4 4 0 0 1 1.87 5.18 4.98 4.98 0 0 1-1.7 8c.02.46.03.93.03 1.4v1h-62v-1zm.83-7.17a30.9 30.9 0 0 0-.62 3.57 3 3 0 0 1-.61-4.2c.37.28.78.49 1.23.63zm1.49-4.61c-.36.87-.68 1.76-.96 2.68a2 2 0 0 1-.21-3.71c.33.4.73.75 1.17 1.03zm2.32-4.54c-.54.86-1.03 1.76-1.49 2.68a3 3 0 0 1-.07-4.67 3 3 0 0 0 1.56 1.99zm1.14-1.7c.35-.5.72-.98 1.1-1.46a1 1 0 1 0-1.1 1.45zm5.34-5.77c-1.03.86-2 1.79-2.9 2.77a3 3 0 0 0-1.11-.77 3 3 0 0 1 4-2zm42.66 2.77c-.9-.98-1.87-1.9-2.9-2.77a3 3 0 0 1 4.01 2 3 3 0 0 0-1.1.77zm1.34 1.54c.38.48.75.96 1.1 1.45a1 1 0 1 0-1.1-1.45zm3.73 5.84c-.46-.92-.95-1.82-1.5-2.68a3 3 0 0 0 1.57-1.99 3 3 0 0 1-.07 4.67zm1.8 4.53c-.29-.9-.6-1.8-.97-2.67.44-.28.84-.63 1.17-1.03a2 2 0 0 1-.2 3.7zm1.14 5.51c-.14-1.21-.35-2.4-.62-3.57.45-.14.86-.35 1.23-.63a2.99 2.99 0 0 1-.6 4.2zM275 214a29 29 0 0 0-57.97 0h57.96zM72.33 198.12c-.21-.32-.34-.7-.34-1.12v-12h-2v12a4.01 4.01 0 0 0 7.09 2.54c.57-.69.91-1.57.91-2.54v-12h-2v12a1.99 1.99 0 0 1-2 2 2 2 0 0 1-1.66-.88zM75 176c.38 0 .74-.04 1.1-.12a4 4 0 0 0 6.19 2.4A13.94 13.94 0 0 1 84 185v24a6 6 0 0 1-6 6h-3v9a5 5 0 1 1-10 0v-9h-3a6 6 0 0 1-6-6v-24a14 14 0 0 1 14-14 5 5 0 0 0 5 5zm-17 15v12a1.99 1.99 0 0 0 1.22 1.84 2 2 0 0 0 2.44-.72c.21-.32.34-.7.34-1.12v-12h2v12a3.98 3.98 0 0 1-5.35 3.77 3.98 3.98 0 0 1-.65-.3V209a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-24c.01-1.53-.23-2.88-.72-4.17-.43.1-.87.16-1.28.17a6 6 0 0 1-5.2-3 7 7 0 0 1-6.47-4.88A12 12 0 0 0 58 185v6zm9 24v9a3 3 0 1 0 6 0v-9h-6z' />
                  <path d='M-17 191a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm19 9a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm-14 5a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm-25 1a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm5 4a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm9 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm15 1a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm12-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2H4zm-11-14a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-19 0a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm6 5a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-25 15c0-.47.01-.94.03-1.4a5 5 0 0 1-1.7-8 3.99 3.99 0 0 1 1.88-5.18 5 5 0 0 1 3.4-6.22 3 3 0 0 1 1.46-1.05 5 5 0 0 1 7.76-3.27A30.86 30.86 0 0 1-14 184c6.79 0 13.06 2.18 18.17 5.88a5 5 0 0 1 7.76 3.27 3 3 0 0 1 1.47 1.05 5 5 0 0 1 3.4 6.22 4 4 0 0 1 1.87 5.18 4.98 4.98 0 0 1-1.7 8c.02.46.03.93.03 1.4v1h-62v-1zm.83-7.17a30.9 30.9 0 0 0-.62 3.57 3 3 0 0 1-.61-4.2c.37.28.78.49 1.23.63zm1.49-4.61c-.36.87-.68 1.76-.96 2.68a2 2 0 0 1-.21-3.71c.33.4.73.75 1.17 1.03zm2.32-4.54c-.54.86-1.03 1.76-1.49 2.68a3 3 0 0 1-.07-4.67 3 3 0 0 0 1.56 1.99zm1.14-1.7c.35-.5.72-.98 1.1-1.46a1 1 0 1 0-1.1 1.45zm5.34-5.77c-1.03.86-2 1.79-2.9 2.77a3 3 0 0 0-1.11-.77 3 3 0 0 1 4-2zm42.66 2.77c-.9-.98-1.87-1.9-2.9-2.77a3 3 0 0 1 4.01 2 3 3 0 0 0-1.1.77zm1.34 1.54c.38.48.75.96 1.1 1.45a1 1 0 1 0-1.1-1.45zm3.73 5.84c-.46-.92-.95-1.82-1.5-2.68a3 3 0 0 0 1.57-1.99 3 3 0 0 1-.07 4.67zm1.8 4.53c-.29-.9-.6-1.8-.97-2.67.44-.28.84-.63 1.17-1.03a2 2 0 0 1-.2 3.7zm1.14 5.51c-.14-1.21-.35-2.4-.62-3.57.45-.14.86-.35 1.23-.63a2.99 2.99 0 0 1-.6 4.2zM15 214a29 29 0 0 0-57.97 0h57.96z' />
                </g>
              </g>
            </svg>
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

const recipeUrlSchema = (t: TFunction) =>
  z.object({
    url: z.string().url(t('recipes.enter-url'))
  })

export type RecipeUrlSchemaType = z.infer<ReturnType<typeof recipeUrlSchema>>

export function UploadRecipeUrlForm({
  onSubmit
}: {
  onSubmit(values: RecipeUrlSchemaType): void
}) {
  const t = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RecipeUrlSchemaType>({
    resolver: zodResolver(recipeUrlSchema(t))
  })

  return (
    <>
      <Dialog.Title as='h3' className='mt-0'>
        {t('recipes.url')}
      </Dialog.Title>
      <form onSubmit={handleSubmit(onSubmit)} className=''>
        <div className='prose mt-2 flex flex-col gap-1'>
          <label htmlFor='url' className='label'>
            <span className='label-text'>{t('recipes.paste')}</span>
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
            {t('recipes.name')}
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
  const t = useTranslation()

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
            <span className='label-text'>{t('recipes.name')}</span>
          </label>
          <input
            id='name'
            {...register('name')}
            className='input input-bordered'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='description' className='label'>
            <span className='label-text'>{t('recipes.description')}</span>
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
              <span className='label-text'>{t('recipes.prep-time')}</span>
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
              <span className='label-text'>{t('recipes.cook-time')}</span>
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
            <span className='label-text'>{t('recipes.ingredients')}</span>
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
            <span className='label-text'>{t('recipes.instructions')}</span>
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
              {t('recipes.cancel')}
            </Button>
            <Button
              isLoading={isLoading}
              className='btn btn-primary w-1/2'
              type='submit'
            >
              {t('recipes.save')}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
