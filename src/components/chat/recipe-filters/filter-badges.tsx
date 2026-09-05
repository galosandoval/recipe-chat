'use client'

import type { Filter } from '~/generated/prisma/client'
import { toast } from '~/components/toast'
import { useTranslations, type Translations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { FilterBadge } from './filter-badge'
import {
  isChatFilterChecked,
  useFiltersByUserId
} from '~/hooks/use-filters-by-user-id'
import { LoadingFilterBadges } from './loading'
import { useChatStore } from '../chat-store'

export function FilterBadges() {
  const { data, status, fetchStatus } = useFiltersByUserId()
  const filters = data ?? []
  const chatFilterIds = useChatStore((s) => s.chatFilterIds)
  const setChatFilterIds = useChatStore((s) => s.setChatFilterIds)

  const t = useTranslations()
  const { mutate: activateFilter } = useActivateFilter()
  const labeledFilters = labelInitialFilters(filters, t).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const handleCheck = (id: string, checked: boolean) => {
    // A resumed Chat's selection shadows the saved state, so a toggle has to
    // land there too or the badge won't move.
    if (chatFilterIds !== null) {
      setChatFilterIds(
        checked
          ? [...new Set([...chatFilterIds, id])]
          : chatFilterIds.filter((filterId) => filterId !== id)
      )
    }
    activateFilter({ checked, filterId: id })
  }

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }
  if (!data && fetchStatus === 'idle' && status === 'pending') {
    return null
  }
  if (status === 'pending') {
    return <LoadingFilterBadges />
  }

  if (filters.length === 0) {
    return <div className='mx-auto'>{t.filters.noFilters}</div>
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {labeledFilters.map((filter) => (
        <FilterBadge
          key={filter.id}
          name={filter.name}
          checked={isChatFilterChecked(filter, chatFilterIds)}
          onClick={() =>
            handleCheck(filter.id, !isChatFilterChecked(filter, chatFilterIds))
          }
        />
      ))}
    </div>
  )
}

function useActivateFilter() {
  const userId = useUserId()
  const utils = api.useUtils()

  const { mutate, variables } = api.filters.check.useMutation({
    onMutate: async (input) => {
      await utils.filters.getByUserId.cancel({ userId })

      const previousFilters = utils.filters.getByUserId.getData({ userId })

      if (!previousFilters) return previousFilters

      utils.filters.getByUserId.setData({ userId }, (old) => {
        if (!old) return old

        return old.map((f) =>
          f.id === input.filterId ? { ...f, checked: input.checked } : f
        )
      })

      return { previousFilters }
    },

    onError: (error, _, ctx) => {
      const previousFilters = ctx?.previousFilters
      if (previousFilters) {
        utils.filters.getByUserId.setData({ userId }, previousFilters)
      }
      toast.error(error.message)
    },

    onSettled: () => {
      const count = utils.filters.check.isMutating()
      // if there are more than 2 mutations, it means that the check filter mutation is being called twice
      // so we need to invalidate the query only once to avoid displaying stale state
      if (count < 2) {
        utils.filters.getByUserId.invalidate({ userId })
      }
    }
  })

  return { mutate, variables }
}

/**
 * Replaces a stock filter's slug name (e.g. `under-30-minutes`) with its
 * localized label, leaving user-created filter names untouched.
 */
function labelInitialFilters(filters: Filter[], t: Translations) {
  return filters.map((f) => {
    let label = f.name
    if (f.name in t.filters.initial) {
      label = t.filters.initial[
        f.name as keyof typeof t.filters.initial
      ] as string
    }
    return { ...f, name: label }
  })
}
