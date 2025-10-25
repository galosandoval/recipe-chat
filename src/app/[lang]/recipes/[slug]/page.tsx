import { api, HydrateClient } from '~/trpc/server'
import RecipeById from './recipe-by-id'
import { notFound } from 'next/navigation'

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

  // Prefetch data into React Query cache
  await api.recipes.bySlug.prefetch({ slug })

  return (
    <HydrateClient>
      <main className='min-h-svh w-full overflow-y-auto'>
        <RecipeById />
      </main>
    </HydrateClient>
  )
}
