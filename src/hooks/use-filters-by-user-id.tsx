'use client'

import { api } from '~/trpc/react'
import { useUserId } from './use-user-id'
import type { Filter } from '@prisma/client'

export const useFiltersByUserId = (select?: (data: Filter[]) => Filter[]) => {
  const userId = useUserId()
  const { data, status } = api.filters.getByUserId.useQuery(
    { userId },
    { enabled: !!userId, select }
  )

  return { data, status }
}

export const selectActiveFilters = (data: Filter[]) =>
  data.filter((f) => f.checked)

export const useActiveFiltersByUserId = () => {
  const { data, status } = useFiltersByUserId(selectActiveFilters)
  return { data, status }
}
