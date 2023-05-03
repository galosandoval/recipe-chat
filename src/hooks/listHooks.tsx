import { Recipe } from '@prisma/client'
import { api } from 'utils/api'

export const useList = () => api.list.byUserId.useQuery()

const selectRecipeNames = (data: Recipe[]) => {
  const nameDictionary: Record<number, string> = {}
  data.forEach((r) => (nameDictionary[r.id] = r.name))
  return nameDictionary
}
export function useRecipeNames(ids: number[]) {
  return api.recipe.byIds.useQuery(ids, {
    select: selectRecipeNames,
    refetchOnWindowFocus: false,
    staleTime: Infinity
  })
}
