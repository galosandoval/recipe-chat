import { useState } from 'react'
import {
  CheckIcon,
  FunnelIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XCircleIcon,
  XIcon
} from './icons'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from 'utils/api'
import { useUserId } from 'hooks/list'
import { Filter } from '@prisma/client'
import { QueryStatus } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createId } from '@paralleldrive/cuid2'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'hooks/useTranslation'

const createFilterSchema = z.object({
  name: z.string().min(3).max(50)
})
type CreateFilter = z.infer<typeof createFilterSchema>

export function useFilters() {
  const userId = useUserId()
  const utils = api.useContext()

  const { data, status } = api.filter.getByUserId.useQuery(
    { userId },
    { enabled: !!userId }
  )

  const { mutate: create } = api.filter.create.useMutation({
    onMutate: async (input) => {
      await utils.filter.getByUserId.cancel({ userId })

      const previousFilters = utils.filter.getByUserId.getData({ userId })

      if (!previousFilters) return previousFilters

      utils.filter.getByUserId.setData({ userId }, (old) => {
        if (!old) return old

        return [
          ...old,
          {
            ...input,
            checked: true,
            id: input.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })

      return { previousFilters }
    }
  })

  const { mutate: checkFilter } = api.filter.check.useMutation({
    onMutate: async (input) => {
      await utils.filter.getByUserId.cancel({ userId })

      const previousFilters = utils.filter.getByUserId.getData({ userId })

      if (!previousFilters) return previousFilters

      utils.filter.getByUserId.setData({ userId }, (old) => {
        if (!old) return old

        const index = old.findIndex((f) => f.id === input.filterId)

        old[index].checked = input.checked

        return old
      })

      return { previousFilters }
    },

    onSuccess: () => {
      utils.filter.getByUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const previousFilters = ctx?.previousFilters
      if (previousFilters) {
        utils.filter.getByUserId.setData({ userId }, previousFilters)
      }
      toast.error(error.message)
    }
  })

  const { mutate: deleteFilter } = api.filter.delete.useMutation({
    onMutate: async (input) => {
      await utils.filter.getByUserId.cancel({ userId })

      const previousFilters = utils.filter.getByUserId.getData({ userId })

      if (!previousFilters) return previousFilters

      utils.filter.getByUserId.setData({ userId }, (old) => {
        if (!old) return old

        const index = old.findIndex((f) => f.id === input.filterId)

        old.splice(index, 1)

        return old
      })

      return { previousFilters }
    },

    onSuccess: () => {
      utils.filter.getByUserId.invalidate({ userId })
    },

    onError: (error, _, ctx) => {
      const previousFilters = ctx?.previousFilters
      if (previousFilters) {
        utils.filter.getByUserId.setData({ userId }, previousFilters)
      }
      toast.error(error.message)
    }
  })

  const [canDelete, setCanDelete] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid }
  } = useForm<CreateFilter>({
    resolver: zodResolver(createFilterSchema)
  })

  const handleToggleCanDelete = () => {
    setCanDelete((prev) => !prev)
  }

  const handleCheck = (id: string, checked: boolean) => {
    checkFilter({ checked, filterId: id })
  }

  const handleRemoveFilter = (id: string) => {
    deleteFilter({ filterId: id })
  }

  const onSubmit = (data: CreateFilter) => {
    setCanDelete(false)

    const id = createId()

    create({ name: data.name, userId, id })

    reset()
  }

  return {
    data,
    canDelete,
    isBtnDisabled: !isDirty || !isValid,
    status,
    handleCheck,
    handleSubmit,
    onSubmit,
    register,
    handleToggleCanDelete,
    handleRemoveFilter
  }
}

export type RecipeFiltersType = ReturnType<typeof useFilters>

export function Filters({
  handleSubmit,
  onSubmit,
  data,
  register,
  handleCheck,
  isBtnDisabled,
  canDelete,
  status,
  handleRemoveFilter,
  handleToggleCanDelete
}: RecipeFiltersType) {
  const session = useSession()

  const t = useTranslation()

  if (session.status !== 'authenticated') {
    return null
  }

  return (
    <div className='flex w-full flex-1 gap-2 flex-col items-center justify-center'>
      <div className='flex items-center gap-2'>
        <h2 className='mb-1 mt-2'>{t('filters.title')}</h2>
        <FunnelIcon />
      </div>

      <List
        canDelete={canDelete}
        filters={data || []}
        status={status}
        handleCheck={handleCheck}
        handleRemoveFilter={handleRemoveFilter}
        handleToggleCanDelete={handleToggleCanDelete}
      />

      <form className='join' onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('name')}
          className='input-bordered input input-sm join-item'
          placeholder={t('filters.placeholder')}
        />
        <button
          type='submit'
          disabled={isBtnDisabled}
          className='no-animation btn-sm join-item btn rounded-r-full'
        >
          <PlusCircleIcon />
        </button>
      </form>
    </div>
  )
}

function List({
  filters,
  canDelete,
  status,
  handleRemoveFilter,
  handleCheck,
  handleToggleCanDelete
}: {
  filters: Filter[]
  canDelete: boolean
  status: QueryStatus
  handleRemoveFilter: (id: string) => void
  handleCheck: (id: string, checked: boolean) => void
  handleToggleCanDelete: () => void
}) {
  if (status === 'error') {
    return <div>Could not get filters, please try again</div>
  }

  if (status === 'success' && filters) {
    return (
      <>
        {filters.length > 0 && (
          <div className='flex w-full flex-wrap gap-4'>
            {filters.map((filter) => {
              const checked = filter.checked && !canDelete

              return (
                <button
                  onClick={
                    canDelete
                      ? () => handleRemoveFilter(filter.id)
                      : () => handleCheck(filter.id, !filter.checked)
                  }
                  key={filter.id}
                  className={`badge flex h-fit items-center gap-1 py-0 ${
                    canDelete
                      ? 'badge-error badge-outline'
                      : checked
                      ? 'badge-primary badge-outline'
                      : 'badge-ghost'
                  }`}
                >
                  <span className='flex items-center'>
                    {checked && <CheckIcon size={4} />}
                    <span className=''>{filter.name}</span>
                    {canDelete && <XCircleIcon size={5} />}
                  </span>
                </button>
              )
            })}

            {filters.length > 0 && (
              <button
                onClick={handleToggleCanDelete}
                className={`btn-circle badge-ghost btn ml-auto`}
              >
                <span>
                  {canDelete ? (
                    <XIcon size={5} />
                  ) : (
                    <PencilSquareIcon size={5} />
                  )}
                </span>
              </button>
            )}
          </div>
        )}
      </>
    )
  }

  return <div className='flex w-full flex-wrap gap-4'>Loading...</div>
}
