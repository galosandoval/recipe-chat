'use client'

import { api } from '~/trpc/react'
import { useUserId } from './use-user-id'
import type { Filter } from '~/generated/prisma/client'

export const useFiltersByUserId = (select?: (data: Filter[]) => Filter[]) => {
  const userId = useUserId()
  const { data, status, ...rest } = api.filters.getByUserId.useQuery(
    { userId },
    { enabled: !!userId, select }
  )

  return { data, status, ...rest }
}

export const selectActiveFilters = (data: Filter[]) =>
  data.filter((f) => f.checked)

export const useActiveFiltersByUserId = () => {
  const { data, status } = useFiltersByUserId(selectActiveFilters)
  return { data, status }
}

/**
 * Whether a Filter is narrowing this chat: the chat's own selection when it has
 * one (a resumed Chat carries the Filters it was generated with), falling back
 * to the Filter's saved state.
 */
export const isChatFilterChecked = (
  filter: Filter,
  chatFilterIds: string[] | null
) =>
  chatFilterIds !== null ? chatFilterIds.includes(filter.id) : filter.checked

/** The Filters narrowing this chat. See {@link isChatFilterChecked}. */
export const selectChatFilters = (
  data: Filter[],
  chatFilterIds: string[] | null
) => data.filter((f) => isChatFilterChecked(f, chatFilterIds))
