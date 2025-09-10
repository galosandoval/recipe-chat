import Image from 'next/image'
import Link from 'next/link'
import { api } from '~/trpc/react'
import { Loader } from '../../../components/loaders/recipe-list-recent'
import { useTranslations } from '~/hooks/use-translations'
import { RecipeFallbackIconSm } from '../../../components/icons'

export function RecentRecipes({ hasSearch }: { hasSearch: boolean }) {
  const t = useTranslations()

  const { data, status } = api.recipes.recentRecipes.useQuery()

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
        <div className='grid-2 col-span-2 grid grid-cols-2 gap-4 sm:col-span-4 sm:grid-cols-4'>
          {data
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((recipe) => (
              <Link
                href={`/recipes/${recipe.id}?name=${encodeURIComponent(
                  recipe.name
                )}`}
                key={recipe.id}
                className='bg-secondary flex h-10 gap-2 overflow-hidden rounded active:scale-[99%]'
              >
                {recipe.imgUrl ? (
                  <Image
                    src={recipe.imgUrl}
                    alt='recipe'
                    height={40}
                    width={40}
                    className='object-cover'
                    priority={true}
                  />
                ) : (
                  <div className='bg-primary/70 self-center'>
                    <RecipeFallbackIconSm />
                  </div>
                )}
                <p className='self-center truncate text-left text-xs whitespace-nowrap'>
                  {recipe.name}
                </p>
              </Link>
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

function Container({ children }: { children: React.ReactNode }) {
  const t = useTranslations()

  return (
    <div className='col-span-2 w-full sm:col-span-4'>
      <h2 className='text-foreground text-sm font-bold'>{t.recipes.recent}</h2>

      {children}
    </div>
  )
}
