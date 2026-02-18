import type { Recipe } from '@prisma/client'
import type { FetchStatus } from '@tanstack/react-query'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from '~/hooks/use-translations'
import { RecentRecipes } from './recipe-list-recent'
import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import Image from 'next/image'
import { api } from '~/trpc/react'
import { RecipeFallbackIconLg } from '~/components/icons'
import { NavigationButton } from '~/components/navigation-button'
import { Button } from '~/components/button'
import { Input } from '~/components/ui/input'
import { BotIcon, SearchIcon, XCircleIcon } from 'lucide-react'
import { navigationStore } from '~/stores/navigation-store'
import { recipesStore } from '~/stores/recipes-store'
import { useDebounce } from '~/hooks/use-recipe'
import { useChatPanelStore } from '~/stores/chat-panel-store'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const { search, setSearch } = recipesStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    const initial = searchParams.get('search') ?? ''
    setSearch(initial)
    if (initial) setIsExpanded(true)
  }, [])

  useEffect(() => {
    if (debouncedSearch) {
      router.replace(`/recipes?search=${debouncedSearch}`)
    } else {
      router.replace('/recipes')
    }
  }, [debouncedSearch, router])

  const handleOpen = () => {
    setIsExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleClose = () => {
    setSearch('')
    setIsExpanded(false)
  }

  const handleBlur = () => {
    if (!search) setIsExpanded(false)
  }

  if (isExpanded) {
    return (
      <div className='flex items-center gap-2 pt-3 pb-1'>
        <Input
          ref={inputRef}
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={handleBlur}
          placeholder={t.recipes.search}
          className='flex-1'
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClose}
        >
          <XCircleIcon className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-between pt-3 pb-1'>
      <h2 className='text-foreground text-sm font-bold'>{t.recipes.your}</h2>
      <Button type='button' variant='ghost' size='icon' onClick={handleOpen}>
        <SearchIcon className='h-4 w-4' />
      </Button>
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
  const openChat = useChatPanelStore((s) => s.open)
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
        <Button variant='default' className='mt-2' onClick={openChat}>
          {t.recipes.noRecipes.empty.link}
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
  const isNavigating = navigationStore((state) => state.isNavigating)
  const targetRoute = navigationStore((state) => state.targetRoute)
  const isThisRoute = targetRoute === `/recipes/${data.slug}`
  const { mutate: updateLastViewedAt } =
    api.recipes.updateLastViewedAt.useMutation({
      onSuccess: (data) => {
        utils.recipes.recentRecipes.setData(undefined, data)
      }
    })

  const handleOnClick = async () => {
    updateLastViewedAt(data.id)
  }

  return (
    <NavigationButton
      href={`/recipes/${data.slug}`}
      onClick={handleOnClick}
      className='bg-background relative col-span-1 h-60 overflow-hidden rounded-md shadow-xl active:scale-[99%] disabled:cursor-wait disabled:opacity-50'
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

      {/* Loading overlay */}
      {isNavigating && isThisRoute && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/20'>
          <LoadingSpinner />
        </div>
      )}
    </NavigationButton>
  )
})
