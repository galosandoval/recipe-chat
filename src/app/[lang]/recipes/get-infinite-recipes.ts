import { api } from '~/trpc/server'

export const getInfiniteRecipes = async () => {
  const data = await api.recipes.infiniteRecipes({
    limit: 10,
    search: ''
  })

  return data
}

export type InfiniteRecipes = Awaited<ReturnType<typeof getInfiniteRecipes>>
