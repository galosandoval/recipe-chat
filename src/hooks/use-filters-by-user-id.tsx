'use client'

import { api } from '~/trpc/react'
import { useUserId } from './use-user-id'

export const useFiltersByUser = () => {
  const userId = useUserId()
  const { data, status } = api.filters.getByUserId.useQuery(
    { userId },
    { enabled: !!userId }
  )

  return { data, status }
}
