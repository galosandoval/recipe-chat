import { api } from '~/trpc/server'
import { RecipeById } from './recipe-by-id'
import { notFound } from 'next/navigation'
import { RecipeDetailChat } from './recipe-detail-chat'
import { RecipeInitialDataProvider } from '~/hooks/use-recipe'
import { auth } from '~/server/auth'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import type { ChatContext } from '~/schemas/chats-schema'
import type { ResumeChatSeed } from '~/hooks/use-resume-chat'

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

  // Resolve this recipe's resumable chat server-side (authenticated users
  // only, mirroring RecipeDetailChat's client-side `isAuthenticated` guard)
  // so the chat drawer's resume state is seeded before the client tree
  // renders instead of racing a client-side fetch.
  const session = await auth()
  let chatSeed: ResumeChatSeed | undefined
  if (session?.user.id) {
    const context: ChatContext = {
      page: 'recipe-detail',
      recipe: {
        id: recipe.id,
        name: recipe.name,
        slug: recipe.slug,
        description: recipe.description,
        ingredients: recipe.ingredients.map((ing) =>
          getIngredientDisplayText(ing)
        ),
        cuisine: recipe.cuisine,
        course: recipe.course
      }
    }
    const resumable = await api.chats.getResumableChat({ context })
    const messages = resumable
      ? await api.chats.getMessagesById({ chatId: resumable.id })
      : null
    chatSeed = { resumable, messages }
  }

  return (
    <RecipeInitialDataProvider slug={slug} recipe={recipe}>
      <div className='min-h-svh w-full'>
        <RecipeById />
      </div>
      <RecipeDetailChat seed={chatSeed} />
    </RecipeInitialDataProvider>
  )
}
