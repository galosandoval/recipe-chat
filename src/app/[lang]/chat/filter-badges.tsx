import type { Filter } from '@prisma/client'
import {
  CheckCircleIcon,
  PencilSquareIcon,
  XCircleIcon,
  XIcon
} from '~/components/icons'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { cn } from '~/utils/cn'

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

    onSuccess: async () => {
      await utils.filters.getByUserId.invalidate({ userId })
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

        const index = old.findIndex((f) => f.id === input.filterId)

        old[index].checked = input.checked

        return old
      })

      return { previousFilters }
    },

    onSuccess: async () => {
      await utils.filters.getByUserId.invalidate({ userId })
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
  const { mutate: deleteFilter, variables: deleteFilterVariables } =
    useDeleteFilter()
  const { mutate: checkFilter, variables: checkFilterVariables } =
    useCheckFilter()

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
    <div className='flex flex-wrap gap-3'>
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
      {filters.length > 0 && (
        <FilterControls
          canDelete={canDelete}
          onToggleCanDelete={onToggleCanDelete}
        />
      )}
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

  return (
    <button
      onClick={
        canDelete
          ? () => onRemove(filter.id)
          : () => onCheck(filter.id, !filter.checked)
      }
      key={filter.id}
      className={cn(
        `bg-base-300 flex h-fit items-center justify-center gap-1 rounded-md px-2 py-1`,
        canDelete && 'badge-error badge-outline',
        checked && 'badge-primary badge-outline',
        !canDelete && !checked && 'badge-ghost'
      )}
    >
      {checked ? (
        <CheckCircleIcon className='h-4 w-4' />
      ) : (
        <span className='border-primary h-4 w-4 rounded-full border'></span>
      )}
      {canDelete && <XCircleIcon size={5} />}
      <span className='text-base-content text-sm whitespace-nowrap'>
        {filter.name}
      </span>
    </button>
  )
}

function FilterControls({
  canDelete,
  onToggleCanDelete
}: {
  canDelete: boolean
  onToggleCanDelete: () => void
}) {
  return (
    <button
      onClick={onToggleCanDelete}
      className={`btn btn-circle badge-ghost ml-auto`}
    >
      <span>
        {canDelete ? <XIcon size={5} /> : <PencilSquareIcon size={5} />}
      </span>
    </button>
  )
}
