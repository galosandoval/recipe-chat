import type { Recipe } from '@prisma/client'
import type { FetchStatus } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { RecentRecipes } from './recipe-list-recent'
import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '~/trpc/react'
import { RecipeFallbackIconLg } from '~/components/icons'
import { Button } from '~/components/button'
import { BotIcon } from 'lucide-react'

export const Recipes = React.memo(function Recipes({
  search,
  fetchStatus,
  recipes
}: {
  recipes: Recipe[]
  search: string
  fetchStatus: FetchStatus
}) {
  const hasPagesAndItems = recipes.length > 0
  return (
    <div className='mx-auto w-full max-w-4xl px-3 pb-4'>
      {hasPagesAndItems ? <RecentRecipes hasSearch={!!search} /> : null}
      <Header />
      <RecipeCards recipes={recipes} search={search} />

      {fetchStatus === 'fetching' && (
        <div className='mt-4 flex justify-center'>
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
})

const Header = React.memo(function Header() {
  const t = useTranslations()

  return (
    <div className='flex items-center justify-between pt-3'>
      <h2 className='text-foreground text-sm font-bold'>{t.recipes.your}</h2>
    </div>
  )
})

const RecipeCards = React.memo(function RecipeCards({
  recipes,
  search
}: {
  recipes: Recipe[]
  search: string
}) {
  const sortedAndFilteredData = useMemo(() => {
    let sortedData = recipes.toSorted((a, b) => {
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
  }, [recipes, search])

  if (recipes.length === 0 && !search) {
    return <EmptyList />
  }
  if (sortedAndFilteredData.length === 0) {
    return <NoneFound />
  }

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {sortedAndFilteredData.map((recipe) => (
        <Card key={recipe.id} data={recipe} />
      ))}
    </div>
  )
})

const EmptyList = React.memo(function EmptyList() {
  const t = useTranslations()
  return (
    <div className='col-span-2 flex min-h-[60vh] items-center justify-center sm:col-span-4'>
      <div className='flex max-w-md flex-col items-center gap-4 text-center'>
        <div className='text-muted-foreground'>
          <BotIcon size={80} />
        </div>
        <div className='space-y-2'>
          <h3 className='text-foreground text-xl font-semibold'>
            {t.recipes.noRecipes.empty.title}
          </h3>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t.recipes.noRecipes.empty.description}
          </p>
        </div>
        <Button asChild variant='default' className='mt-2'>
          <Link href='/chat'>{t.recipes.noRecipes.empty.link}</Link>
        </Button>
      </div>
    </div>
  )
})

const NoneFound = React.memo(function NoneFound() {
  const t = useTranslations()
  return (
    <div className='col-span-2 flex min-h-[60vh] items-center justify-center sm:col-span-4'>
      <div className='flex max-w-md flex-col items-center gap-4 text-center'>
        <div className='text-muted-foreground/50'>
          <RecipeFallbackIconLg />
        </div>
        <div className='space-y-2'>
          <h3 className='text-foreground text-xl font-semibold'>
            {t.recipes.noRecipes.search.title}
          </h3>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t.recipes.noRecipes.search.description}
          </p>
        </div>
      </div>
    </div>
  )
})

const Card = React.memo(function Card({ data }: { data: Recipe }) {
  const utils = api.useUtils()
  const { mutate: updateLastViewedAt } =
    api.recipes.updateLastViewedAt.useMutation({
      onSuccess: (data) => {
        utils.recipes.recentRecipes.setData(undefined, data)
      }
    })

  const handleOnClick = () => {
    updateLastViewedAt(data.id)
  }

  return (
    <Link
      href={`/recipes/${data.slug}`}
      className='bg-background relative col-span-1 overflow-hidden rounded-md shadow-xl active:scale-[99%]'
      onClick={handleOnClick}
    >
      <div className='w-full'>
        {data.imgUrl ? (
          <div className='w-full'>
            <div className='relative h-60'>
              <Image
                className='object-cover'
                src={data.imgUrl}
                priority
                alt='recipe'
                fill
                sizes='(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 50vw'
              />
            </div>
          </div>
        ) : (
          <div className='bg-primary/70 flex h-60 items-center justify-center'>
            <RecipeFallbackIconLg />
          </div>
        )}
      </div>
      <div className='glass-background absolute top-0 z-0 flex w-full flex-col p-3'>
        <h3 className='mt-0 mb-0 overflow-hidden text-sm font-bold text-ellipsis whitespace-nowrap'>
          {data.name}
        </h3>
      </div>
    </Link>
  )
})
