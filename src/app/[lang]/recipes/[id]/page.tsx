import { api, HydrateClient } from '~/trpc/server'
import Recipe from './recipe'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await api.recipes.byId({ id })
  if (!data) {
    return notFound()
  }
  return {
    title: data.name,
    description: data.description
  }
}

export default async function RecipePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await api.recipes.byId({ id })
  if (!data) {
    return notFound()
  }
  return (
    <HydrateClient>
      <main className='flex min-h-svh flex-col items-center justify-center'>
        <Suspense fallback={<ScreenLoader />}>
          <Recipe data={data} />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
