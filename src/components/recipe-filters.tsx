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
import { useUserId } from 'hooks/use-list'
import { type Filter } from '@prisma/client'
import { type QueryStatus } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createId } from '@paralleldrive/cuid2'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'hooks/use-translation'
import { ValuePropsHeader } from './value-props'
import { ErrorMessage } from './error-message-content'
import { TFunction } from 'i18next'

const createFilterSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(3, t('filters.min-chars-3'))
      .max(50, t('filters.min-chars-50'))
  })

type CreateFilter = z.infer<ReturnType<typeof createFilterSchema>>

export function useFilters() {
  const t = useTranslation()

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

    onSuccess: async () => {
      await utils.filter.getByUserId.invalidate({ userId })
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

    onSuccess: async () => {
      await utils.filter.getByUserId.invalidate({ userId })
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
    formState: { isDirty, isValid, errors }
  } = useForm<CreateFilter>({
    resolver: zodResolver(createFilterSchema(t))
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
    errors,
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
  errors,
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

  const activeFilters = data?.filter((f) => f.checked)

  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center gap-2'>
      <ValuePropsHeader icon={<FunnelIcon />} label={t('filters.title')} />

      <List
        canDelete={canDelete}
        filters={data ?? []}
        status={status}
        handleCheck={handleCheck}
        handleRemoveFilter={handleRemoveFilter}
        handleToggleCanDelete={handleToggleCanDelete}
      />

      {data?.length ? (
        <small className=''>
          {t('filters.active')} {activeFilters?.length}
        </small>
      ) : null}

      <form className='join' onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('name')}
          className='input join-item input-bordered input-sm'
          placeholder={t('filters.placeholder')}
        />
        <button
          type='submit'
          className='btn join-item no-animation btn-sm rounded-r-full'
        >
          <PlusCircleIcon />
        </button>
      </form>

      {errors.name && (
        <div className='flex w-full items-center pl-1 sm:pl-4'>
          <ErrorMessage name='name' errors={errors} />
        </div>
      )}
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
  const t = useTranslation()

  if (status === 'error') {
    return <div>{t('error.something-went-wrong')}</div>
  }

  if (status === 'success' && filters) {
    const notEmpty = filters.length > 0

    return (
      <>
        {notEmpty && (
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

            <button
              onClick={handleToggleCanDelete}
              className={`btn btn-circle badge-ghost ml-auto`}
            >
              <span>
                {canDelete ? <XIcon size={5} /> : <PencilSquareIcon size={5} />}
              </span>
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className='flex w-full flex-wrap gap-4'>{t('loading.screen')}</div>
  )
}
