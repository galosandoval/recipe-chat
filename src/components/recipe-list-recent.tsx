import Image from 'next/image'
import Link from 'next/link'
import { api } from '~/trpc/react'
import { Loader } from './loaders/recipe-list-recent'
import { useTranslations } from '~/hooks/use-translations'
import { RecipeFallbackIconSm } from './icons'

export function RecentRecipes() {
  const t = useTranslations()

  const { data, status } = api.recipes.recentRecipes.useQuery()

  if (status === 'error') {
    return <div className=''>{t.error.somethingWentWrong}</div>
  }

  if (status === 'success') {
    if (data.length === 0) {
      return null
    }

    return (
      <Container>
        <div className='grid-2 col-span-2 grid grid-cols-2 gap-4 sm:col-span-4 sm:grid-cols-4'>
          {data.map((recipe) => (
            <Link
              href={`/recipes/${recipe.id}?name=${encodeURIComponent(
                recipe.name
              )}`}
              key={recipe.id}
              className='bg-base-300 flex h-10 gap-2 overflow-hidden rounded active:scale-[99%]'
            >
              {recipe.imgUrl ? (
                <Image
                  src={recipe.imgUrl}
                  alt='recipe'
                  height={40}
                  width={40}
                  className='mt-0 mb-0 object-cover'
                  priority={true}
                />
              ) : (
                <div className='bg-primary/70 self-center'>
                  <RecipeFallbackIconSm />
                </div>
              )}
              <p className='prose self-center truncate text-left text-xs whitespace-nowrap'>
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
      <h2 className='text-base-content text-sm font-bold'>
        {t.recipes.recent}
      </h2>

      {children}
    </div>
  )
}
