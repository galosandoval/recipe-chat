import { useEffect, useRef, useState } from 'react'
import { FunnelIcon, PlusCircleIcon } from '~/components/icons'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '~/trpc/react'
import { type Filter } from '@prisma/client'
import { toast } from '~/components/toast'
import { createId } from '@paralleldrive/cuid2'
import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { ValuePropsHeader } from './value-props'
import { ErrorMessage } from '~/components/error-message-content'
import { useUserId } from '~/hooks/use-user-id'
import { useFiltersByUser } from '~/hooks/use-filters-by-user-id'
import { FilterBadges } from './filter-badges'
import { cn } from '~/utils/cn'

export const filterSchema = (t: any) =>
  z.object({
    name: z.string().min(3, t.filters.minChars3).max(50, t.filters.maxChars50)
  })

type CreateFilter = z.infer<ReturnType<typeof filterSchema>>

export function FiltersByUser() {
  const { data, status } = useFiltersByUser()
  const t = useTranslations()

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }

  if (status === 'pending') {
    return null
  }

  return <FiltersSection data={data ?? []} />
}

function useCreateFilter() {
  const userId = useUserId()
  const utils = api.useUtils()
  const { mutate } = api.filters.create.useMutation({
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

  return { mutate }
}

function useCreateFilterForm() {
  const t = useTranslations()
  const { mutate } = useCreateFilter()

  const {
    handleSubmit,
    resetField,
    control,
    formState: { errors, isDirty, touchedFields }
  } = useForm<CreateFilter>({
    resolver: zodResolver(filterSchema(t)),
    defaultValues: {
      name: ''
    }
  })

  const handleCreateFilter = (data: CreateFilter) => {
    const id = createId()
    mutate({ name: data.name, id })
    resetField('name')
  }

  const onSubmit = (data: CreateFilter) => {
    handleCreateFilter(data)
  }

  return { handleSubmit, control, errors, isDirty, touchedFields, onSubmit }
}

function CreateFilterForm() {
  const t = useTranslations()
  const { onSubmit, handleSubmit, control, errors, isDirty, touchedFields } =
    useCreateFilterForm()

  return (
    <>
      <form className='join w-full' onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className='input join-item input-bordered input-sm'
              placeholder={t.filters.placeholder}
            />
          )}
        />
        <button
          type='submit'
          className='btn btn-outline join-item no-animation btn-sm'
        >
          <PlusCircleIcon />
          <span>{t.filters.add}</span>
        </button>
      </form>
      {errors.name && isDirty && touchedFields.name && (
        <ErrorMessage name='name' errors={errors} align='center' />
      )}
    </>
  )
}

export function FiltersSection({ data }: { data: Filter[] }) {
  const session = useSession()
  const t = useTranslations()

  const [canDelete, setCanDelete] = useState(false)

  const toggleCanDelete = () => {
    setCanDelete((prev) => !prev)
  }

  if (session.status !== 'authenticated') {
    return null
  }

  return (
    <section className='flex w-full flex-1 flex-col items-center justify-center'>
      <ValuePropsHeader icon={<FunnelIcon />} label={t.filters.title} />
      <div className='flex w-full flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4'>
          <p className='text-base-content/80 text-sm'>
            {t.filters.description}
          </p>
        </div>
        <FilterBadges
          filters={data ?? []}
          canDelete={canDelete}
          onToggleCanDelete={toggleCanDelete}
        />
        <div className='flex w-full flex-col px-4'>
          <ActiveFiltersCount data={data ?? []} />
          <CreateFilterForm />
        </div>
      </div>
    </section>
  )
}

// 550ms is the duration of the bounce animation
const ANIMATION_DURATION = 550

function ActiveFiltersCount({ data }: { data: Filter[] }) {
  const t = useTranslations()
  const [isBouncing, setIsBouncing] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const activeFiltersCount = data.filter((f) => f.checked).length

  useEffect(() => {
    setRenderCount((prev) => prev + 1)
    if (renderCount > 1) {
      setIsBouncing(true)
      timeoutRef.current = setTimeout(() => {
        setIsBouncing(false)
      }, ANIMATION_DURATION)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [activeFiltersCount])
  return (
    <div className='self-start'>
      <small className='text-xs'>{t.filters.active}</small>
      <span
        className={cn(
          'text-primary-content relative inline-block pl-1 text-xs',
          isBouncing && 'animate-bounce'
        )}
      >
        {activeFiltersCount}
      </span>
    </div>
  )
}
