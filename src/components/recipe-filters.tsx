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
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '~/utils/api'
import { useUserId } from '~/hooks/use-list'
import { type Filter } from '@prisma/client'
import toast from 'react-hot-toast'
import { createId } from '@paralleldrive/cuid2'
import { useSession } from 'next-auth/react'
import { useTranslation } from '~/hooks/use-translation'
import { ValuePropsHeader } from './value-props'
import { ErrorMessage } from './error-message-content'
import { type TFunction } from 'i18next'

const createFilterSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(3, t('filters.min-chars-3'))
      .max(50, t('filters.min-chars-50'))
  })

type CreateFilter = z.infer<ReturnType<typeof createFilterSchema>>

export const useFiltersByUser = () => {
  const userId = useUserId()
  const { data, status } = api.filters.getByUserId.useQuery(
    { userId },
    { enabled: !!userId }
  )

  return { data, status }
}

export function FiltersByUser() {
  const { data, status } = useFiltersByUser()
  const t = useTranslation()

  if (status === 'error') {
    return <div>{t('error.something-went-wrong')}</div>
  }

  if (status === 'loading') {
    return <div>{t('loading.screen')}</div>
  }

  return <Filters data={data ?? []} />
}

function CreateFilterForm({
  onCreate
}: {
  onCreate: (data: CreateFilter) => void
}) {
  const t = useTranslation()
  const {
    handleSubmit,
    resetField,
    setFocus,
    control,
    formState: { errors, isDirty, touchedFields }
  } = useForm<CreateFilter>({
    resolver: zodResolver(createFilterSchema(t)),
    defaultValues: {
      name: ''
    }
  })

  const onSubmit = (data: CreateFilter) => {
    onCreate(data)
    resetField('name')
    setFocus('name')
  }

  return (
    <>
      <form className='join' onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className='input join-item input-bordered input-sm'
              placeholder={t('filters.placeholder')}
            />
          )}
        />
        <button
          type='submit'
          className='btn btn-outline join-item no-animation btn-sm'
        >
          <PlusCircleIcon />
          <span>{t('filters.add')}</span>
        </button>
      </form>
      {errors.name && isDirty && touchedFields.name && (
        <ErrorMessage name='name' errors={errors} align='center' />
      )}
    </>
  )
}

function FilterItem({
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
}

function FilterList({
  filters,
  canDelete,
  onCheck,
  onRemove
}: {
  filters: Filter[]
  canDelete: boolean
  onCheck: (id: string, checked: boolean) => void
  onRemove: (id: string) => void
}) {
  const t = useTranslation()

  if (filters.length === 0) {
    return <div>{t('filters.no-filters')}</div>
  }

  return (
    <div className='flex w-full flex-wrap gap-4'>
      {filters.map((filter) => (
        <FilterItem
          key={filter.id}
          filter={filter}
          canDelete={canDelete}
          onCheck={onCheck}
          onRemove={onRemove}
        />
      ))}
    </div>
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

function ActiveFiltersSummary({
  activeFiltersCount
}: {
  activeFiltersCount: number
}) {
  const t = useTranslation()
  return (
    <small className=''>
      {t('filters.active')} {activeFiltersCount}
    </small>
  )
}

export function Filters({ data }: { data: Filter[] }) {
  const session = useSession()

  const t = useTranslation()

  const userId = useUserId()
  const utils = api.useContext()

  const { mutate: createFilter } = api.filters.create.useMutation({
    onMutate: async (input) => {
      await utils.filters.getByUserId.cancel({ userId })

      const previousFilters = utils.filters.getByUserId.getData({ userId })

      if (!previousFilters) return previousFilters

      utils.filters.getByUserId.setData({ userId }, (old) => {
        if (!old) return old

        return [
          ...old,
          {
            ...input,
            userId,
            checked: true,
            id: input.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
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

  const { mutate: checkFilter } = api.filters.check.useMutation({
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

  const { mutate: deleteFilter } = api.filters.delete.useMutation({
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

  const [canDelete, setCanDelete] = useState(false)

  const handleToggleCanDelete = () => {
    setCanDelete((prev) => !prev)
  }

  const handleCheck = (id: string, checked: boolean) => {
    checkFilter({ checked, filterId: id })
  }

  const handleRemoveFilter = (id: string) => {
    deleteFilter({ filterId: id })
    if (data.length === 1) {
      setCanDelete(false)
    }
  }

  const handleCreateFilter = (data: CreateFilter) => {
    const id = createId()
    createFilter({ name: data.name, id })
  }

  if (session.status !== 'authenticated') {
    return null
  }

  const activeFilters = data?.filter((f) => f.checked)

  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center gap-2'>
      <ValuePropsHeader icon={<FunnelIcon />} label={t('filters.title')} />

      <div className='flex w-full flex-wrap gap-4'>
        <FilterList
          filters={data ?? []}
          canDelete={canDelete}
          onCheck={handleCheck}
          onRemove={handleRemoveFilter}
        />
        <FilterControls
          canDelete={canDelete}
          onToggleCanDelete={handleToggleCanDelete}
        />
      </div>

      {data?.length ? (
        <ActiveFiltersSummary activeFiltersCount={activeFilters?.length ?? 0} />
      ) : null}

      <CreateFilterForm onCreate={handleCreateFilter} />
    </div>
  )
}
