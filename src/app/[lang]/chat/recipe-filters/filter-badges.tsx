'use client'

import type { Filter } from '@prisma/client'
import { CheckCircleIcon, XCircleIcon } from '~/components/icons'
import { toast } from '~/components/toast'
import { useTranslations, type Translations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { cn } from '~/utils/cn'
import { Badge } from '../badge'
import { useMemo } from 'react'

export function FilterBadges({
  filters,
  canDelete,
  containerRef,
  onToggleCanDelete
}: {
  filters: Filter[]
  canDelete: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  onToggleCanDelete: () => void
}) {
  const t = useTranslations()
  const { mutate: deleteFilter } = useDeleteFilter()
  const { mutate: activateFilter } = useActivateFilter()
  const { firstHalf, secondHalf } = useMemo(
    () => transformAndSplit(filters, t),
    [filters]
  )

  const handleRemoveFilter = (id: string) => {
    deleteFilter({ filterId: id })
    if (filters.length === 1) {
      onToggleCanDelete()
    }
  }

  const handleCheck = (id: string, checked: boolean) => {
    activateFilter({ checked, filterId: id })
  }

  if (filters.length === 0) {
    return <div className='mx-auto'>{t.filters.noFilters}</div>
  }

  if (filters.length === 1) {
    return (
      <div className='px-2'>
        <FilterBadge
          key={filters[0].id}
          filter={filters[0]}
          canDelete={canDelete}
          onCheck={handleCheck}
          onRemove={handleRemoveFilter}
          t={t}
        />
      </div>
    )
  }

  return (
    <div
      id='filter-badges'
      className='grid h-[5.3rem] grid-rows-2 gap-2 overflow-x-scroll px-2'
      ref={containerRef}
    >
      {/* splits in half because I couldn't figure out how to css the exact middle of item size */}
      {[firstHalf, secondHalf].map((half, idx) => (
        <div key={idx} className='flex w-full gap-2'>
          {half.map((filter) => (
            <FilterBadge
              key={filter.id}
              filter={filter}
              canDelete={canDelete}
              onCheck={handleCheck}
              onRemove={handleRemoveFilter}
              t={t}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function FilterBadge({
  filter,
  canDelete,
  onCheck,
  onRemove,
  t
}: {
  filter: Filter
  canDelete: boolean
  onCheck: (id: string, checked: boolean) => void
  onRemove: (id: string) => void
  t: Translations
}) {
  const checked = filter.checked && !canDelete

  let icon = null
  if (checked) {
    icon = <CheckCircleIcon className='h-4 w-4' />
  } else if (canDelete) {
    icon = <XCircleIcon size={4} />
  } else {
    icon = <span className='border-primary h-4 w-4 rounded-full border'></span>
  }
  const handleClick = canDelete
    ? () => onRemove(filter.id)
    : () => onCheck(filter.id, !filter.checked)

  return (
    <Badge
      icon={icon}
      label={filter.name}
      onClick={handleClick}
      className={cn(
        canDelete && 'border-error text-error',
        checked && 'border-primary text-primary'
      )}
    />
  )
}

function useDeleteFilter() {
  const userId = useUserId()
  const utils = api.useUtils()

  const { mutate, variables } = api.filters.delete.useMutation({
    onMutate: async (input) => {
      await utils.filters.getByUserId.cancel({ userId })

      const previousFilters = utils.filters.getByUserId.getData({ userId })

      if (!previousFilters) return previousFilters

      utils.filters.getByUserId.setData({ userId }, (old) => {
        if (!old) return old

        const index = old.findIndex((f) => f.id === input.filterId)

        old.splice(index, 1)

        return old
      })

      return { previousFilters }
    },

    onSettled: () => {
      const count = utils.filters.delete.isMutating()
      // if there are more than 2 mutations, it means that the check filter mutation is being called twice
      // so we need to invalidate the query only once to avoid displaying stale state
      if (count < 2) {
        utils.filters.getByUserId.invalidate({ userId })
      }
    },

    onError: (error, _, ctx) => {
      const previousFilters = ctx?.previousFilters
      if (previousFilters) {
        utils.filters.getByUserId.setData({ userId }, previousFilters)
      }
      toast.error(error.message)
    }
  })

  return { mutate, variables }
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

function transformAndSplit(filters: Filter[], t: Translations) {
  if (filters.length === 0) {
    return {
      firstHalf: [],
      secondHalf: []
    }
  }
  const labeledFilters = labelInitialFilters(filters, t)

  const sortedFilters = labeledFilters.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const filterIdxToName: Record<number, string> = {}
  sortedFilters.forEach((f, i) => {
    filterIdxToName[i] = f.name
  })
  let namesJoined = sortedFilters.map((f) => f.name).join('')
  let lastIdx = 0
  const startLength = namesJoined.length
  for (let i = 0; i < sortedFilters.length; i++) {
    const filter = sortedFilters[i]
    const filterName = filter.name
    namesJoined = namesJoined.replace(filterName, '')
    if (namesJoined.length < startLength / 2) {
      lastIdx = i
      break
    }
  }

  return {
    firstHalf: sortedFilters.slice(0, lastIdx),
    secondHalf: sortedFilters.slice(lastIdx)
  }
}
