'use client'

import type { Filter } from '@prisma/client'
import { toast } from '~/components/toast'
import { useTranslations, type Translations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/badge'
import { useMemo } from 'react'
import { CheckCircleIcon, CircleIcon, XCircleIcon } from 'lucide-react'
import { middleIndexOfNames } from '~/lib/middle-index-of-names'
import { useFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { LoadingFilterBadges } from './loading'

export function FilterBadges({
  canDelete,
  containerRef,
  onToggleCanDelete
}: {
  canDelete: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  onToggleCanDelete: () => void
}) {
  const { data, status, fetchStatus } = useFiltersByUserId()
  const filters = data ?? []

  const t = useTranslations()
  const { mutate: deleteFilter } = useDeleteFilter()
  const { mutate: activateFilter } = useActivateFilter()
  const { firstHalf, secondHalf } = useMemo(
    () => transform(filters, t),
    [filters, t]
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

  if (filters.length === 1) {
    return (
      <div className='px-2'>
        <FilterBadge
          key={filters[0].id}
          filter={filters[0]}
          canDelete={canDelete}
          onCheck={handleCheck}
          onRemove={handleRemoveFilter}
        />
      </div>
    )
  }

  return (
    <div
      className='grid h-20 grid-rows-[min-content] gap-1 overflow-x-scroll px-2'
      ref={containerRef}
    >
      {/* splits in half because I couldn't figure out how to css the exact middle of item size */}
      {[firstHalf, secondHalf].map((half, idx) => (
        <div key={idx} className='flex h-fit w-full gap-2'>
          {half.map((filter) => (
            <FilterBadge
              key={filter.id}
              filter={filter}
              canDelete={canDelete}
              onCheck={handleCheck}
              onRemove={handleRemoveFilter}
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
  onRemove
}: {
  filter: Filter
  canDelete: boolean
  onCheck: (id: string, checked: boolean) => void
  onRemove: (id: string) => void
}) {
  const checked = filter.checked && !canDelete

  let icon = null
  if (checked) {
    icon = <CheckCircleIcon className='size-5' />
  } else if (canDelete) {
    icon = <XCircleIcon className='size-5' />
  } else {
    icon = <CircleIcon className='text-primary size-5' />
  }
  const handleClick = canDelete
    ? () => onRemove(filter.id)
    : () => onCheck(filter.id, !filter.checked)

  return (
    <Badge
      icon={icon}
      label={filter.name}
      variant='outline'
      onClick={handleClick}
      className={cn(
        'select-none',
        canDelete && 'border-destructive text-destructive',
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

        return old.filter((f) => f.id !== input.filterId)
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

function transform(filters: Filter[], t: Translations) {
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

  const index = middleIndexOfNames(sortedFilters)

  return {
    firstHalf: sortedFilters.slice(0, index),
    secondHalf: sortedFilters.slice(index)
  }
}
