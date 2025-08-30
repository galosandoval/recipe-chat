import type { Filter } from '@prisma/client'
import { CheckCircleIcon, XCircleIcon } from '~/components/icons'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { cn } from '~/utils/cn'
import { Badge } from './badge'

export function FilterBadges({
  filters,
  canDelete,
  onToggleCanDelete
}: {
  filters: Filter[]
  canDelete: boolean
  onToggleCanDelete: () => void
}) {
  const t = useTranslations()
  const { mutate: deleteFilter } = useDeleteFilter()
  const { mutate: checkFilter } = useCheckFilter()

  if (filters.length === 0) {
    return <div className='mx-auto'>{t.filters.noFilters}</div>
  }

  const handleRemoveFilter = (id: string) => {
    deleteFilter({ filterId: id })
    if (filters.length === 1) {
      onToggleCanDelete()
    }
  }

  const handleCheck = (id: string, checked: boolean) => {
    checkFilter({ checked, filterId: id })
  }

  return (
    <div
      id='filter-badges'
      className='grid h-[5.3rem] grid-flow-col grid-rows-2 place-items-start justify-start gap-2 overflow-x-scroll px-2'
    >
      {filters
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((filter) => (
          <FilterBadge
            key={filter.id}
            filter={filter}
            canDelete={canDelete}
            onCheck={handleCheck}
            onRemove={handleRemoveFilter}
          />
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

function useCheckFilter() {
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
