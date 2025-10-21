import { api, HydrateClient } from '~/trpc/server'
import RecipeById from './recipe-by-id'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await api.recipes.bySlug({ slug })
  if (!data) {
    return notFound()
  }
  return {
    title: data.name,
    description: data.description
  }
}

export default async function RecipeByIdPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await api.recipes.bySlug({ slug })
  if (!data) {
    return notFound()
  }
  return (
    <HydrateClient>
      <main className='min-h-svh w-full overflow-y-auto'>
        <Suspense fallback={<ScreenLoader />}>
          <RecipeById data={data} />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
