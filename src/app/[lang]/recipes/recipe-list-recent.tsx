'use client'

import { api, type RouterOutputs } from '~/trpc/react'
import { Loader } from '../../../components/loaders/recipe-list-recent'
import { useTranslations } from '~/hooks/use-translations'
import { useMemo } from 'react'
import { RecipeFallbackIconSm } from '~/components/icons'
import Image from 'next/image'
import { NavigationButton } from '~/components/navigation-button'

export function RecentRecipes({ hasSearch }: { hasSearch: boolean }) {
  const t = useTranslations()

  const { data, status } = api.recipes.recentRecipes.useQuery()
  const sortedData = useMemo(
    () => data?.toSorted((a, b) => a.name.localeCompare(b.name)) ?? [],
    [data]
  )

  if (status === 'error') {
    return <div className=''>{t.error.somethingWentWrong}</div>
  }

  if (hasSearch) {
    return null
  }

  if (status === 'success') {
    if (data.length === 0) {
      return null
    }

    return (
      <Container>
        <div className='grid-2 relative z-0 col-span-2 grid grid-cols-2 gap-3 sm:col-span-4 sm:grid-cols-4'>
          {sortedData.map((recipe) => (
            <RecentRecipe key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Loader />
    </Container>
  )
}

function RecentRecipe({
  recipe
}: {
  recipe: RouterOutputs['recipes']['recentRecipes'][number]
}) {
  return (
    <NavigationButton
      href={`/recipes/${recipe.slug}`}
      className='bg-secondary flex h-10 w-full gap-2 overflow-hidden rounded-md shadow active:scale-[99%] disabled:cursor-wait disabled:opacity-50'
    >
      {recipe.imgUrl ? (
        <div className='aspect-square h-full w-10'>
          <Image
            src={recipe.imgUrl}
            alt='recipe'
            height={40}
            width={40}
            className='h-full w-full object-cover'
            priority={true}
          />
        </div>
      ) : (
        <div className='bg-primary/70 self-center'>
          <RecipeFallbackIconSm />
        </div>
      )}
      <p className='self-center truncate pr-2 text-left text-xs whitespace-nowrap'>
        {recipe.name}
      </p>
    </NavigationButton>
  )
}

function Container({ children }: { children: React.ReactNode }) {
  const t = useTranslations()

  return (
    <div className='col-span-2 w-full sm:col-span-4'>
      <h2 className='text-foreground text-sm font-bold'>{t.recipes.recent}</h2>

      {children}
    </div>
  )
}
