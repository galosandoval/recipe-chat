import { api } from '~/trpc/server'
import { RecipeById } from './recipe-by-id'
import { notFound } from 'next/navigation'
import { RecipeDetailChat } from './recipe-detail-chat'
import { RecipeInitialDataProvider } from '~/hooks/use-recipe'

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

  // Fetch on the server (authenticated RSC context) and hand the recipe to the
  // client tree as seeded query data. This replaces a `prefetch`/hydrate flow
  // whose client `useSuspenseQuery` still refetched during SSR without the
  // session cookie, throwing a swallowed `UNAUTHORIZED` on every load (#545).
  const recipe = await api.recipes.bySlug({ slug })
  if (!recipe) {
    return notFound()
  }

  return (
    <RecipeInitialDataProvider slug={slug} recipe={recipe}>
      <div className='min-h-svh w-full'>
        <RecipeById />
      </div>
      <RecipeDetailChat />
    </RecipeInitialDataProvider>
  )
}
