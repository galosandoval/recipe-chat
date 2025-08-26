import type { Recipe } from '@prisma/client'
import type { FetchStatus } from '@tanstack/react-query'
import React, { Fragment, useCallback, useMemo } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { CreateRecipeButton } from './create-recipe-button'
import { RecentRecipes } from './recipe-list-recent'
import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '~/trpc/react'
import { RecipeFallbackIconLg } from '~/components/icons'

export const RecipesPages = React.memo(function RecipesPages({
  search,
  pages,
  fetchStatus
}: {
  pages: {
    items: Recipe[]
    nextCursor: string | undefined
  }[]
  search: string
  fetchStatus: FetchStatus
}) {
  const t = useTranslations()

  return (
    <div className='grid max-w-4xl grid-cols-2 gap-5 pb-4 sm:grid-cols-4'>
      {pages.length > 0 && pages[0].items.length > 0 ? (
        <RecentRecipes hasSearch={!!search} />
      ) : null}
      <div className='col-span-2 flex h-10 items-center justify-between sm:col-span-4'>
        <h2 className='text-base-content text-sm font-bold'>
          {t.recipes.your}
        </h2>
        {!search && <CreateRecipeButton />}
      </div>

      <Pages pages={pages} search={search} />

      {fetchStatus === 'fetching' && (
        <div className='col-span-2 mt-4 flex justify-center sm:col-span-4'>
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
})

const Pages = React.memo(function Pages({
  pages,
  search
}: {
  pages: { items: Recipe[] }[]
  search: string
}) {
  if (pages.length === 0) {
    return <NoneFound />
  }

  return (
    <>
      {pages.map((page, i) => {
        if (page.items.length === 0 && search) {
          return <NoneFound key={i} />
        }

        return (
          <Fragment key={i}>
            {page.items.length > 0 ? (
              <Cards data={page.items} search={search} />
            ) : (
              <EmptyList />
            )}
          </Fragment>
        )
      })}
    </>
  )
})

const EmptyList = React.memo(function EmptyList() {
  const t = useTranslations()
  return (
    <div className='col-span-2 sm:col-span-4'>
      <p>
        {t.recipes.noRecipes.message}
        <Link className='link' href='/chat'>
          {t.recipes.noRecipes.link}
        </Link>
      </p>
    </div>
  )
})

const NoneFound = React.memo(function NoneFound() {
  const t = useTranslations()
  return (
    <div className='col-span-2 sm:col-span-4'>
      <p>{t.recipes.noRecipes.noneFound}</p>
    </div>
  )
})

const Cards = React.memo(function Cards({
  data,
  search
}: {
  data: Recipe[]
  search: string
}) {
  const sortedAndFilteredData = useMemo(() => {
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

    return sortedData
  }, [data, search])

  return sortedAndFilteredData.map((recipe) => (
    <Card key={recipe.id} data={recipe} />
  ))
})

const Card = React.memo(function Card({ data }: { data: Recipe }) {
  const { mutate } = api.recipes.updateLastViewedAt.useMutation()

  const handleUpdateLastViewedAt = useCallback(() => {
    mutate(data.id)
  }, [mutate, data.id])

  return (
    <Link
      href={`/recipes/${data.id}`}
      key={data.id}
      className='bg-base-100 relative col-span-1 overflow-hidden rounded shadow-xl active:scale-[99%]'
      onClick={handleUpdateLastViewedAt}
    >
      <div className='w-full'>
        {data.imgUrl ? (
          <div className='w-full'>
            <div className='relative h-60'>
              <Image
                className='mt-0 mb-0 object-bottom'
                src={data.imgUrl}
                priority={false}
                alt='recipe'
                fill
                sizes='(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 33vw'
              />
            </div>
          </div>
        ) : (
          <div className='bg-primary/70 flex h-60 items-center justify-center'>
            <RecipeFallbackIconLg />
          </div>
        )}
      </div>
      <div className='glass-element absolute top-0 z-0 flex w-full flex-col p-3'>
        <h3 className='text-glass mt-0 mb-0 overflow-hidden text-sm font-bold text-ellipsis whitespace-nowrap'>
          {data.name}
        </h3>
      </div>
    </Link>
  )
})
