import { useEffect, useState } from 'react'
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

type Filters = Record<string, boolean>
const createFilterSchema = z.object({
  name: z.string().min(3).max(50)
})
type CreateFilter = z.infer<typeof createFilterSchema>

export function useRecipeFilters() {
  const [filters, setFilters] = useState<Filters>(
    typeof window !== 'undefined' &&
      typeof localStorage.checkedFilters === 'string'
      ? (JSON.parse(localStorage.checkedFilters) as Filters)
      : {}
  )
  const [canDelete, setCanDelete] = useState(false)

  const filtersArr = Object.keys(filters)

  const checkedFilters: string[] = []
  for (const [filter, checked] of Object.entries(filters)) {
    if (checked) {
      checkedFilters.push(filter)
    }
  }

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

  const handleCheck = (filter: string) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }))
  }

  const handleRemoveFilter = (filter: string) => {
    setFilters((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [filter]: _, ...rest } = prev
      return rest
    })
  }

  const onSubmit = (data: CreateFilter) => {
    setCanDelete(false)

    setFilters((prev) => ({ ...prev, [data.name]: true }))

    reset()
  }

  useEffect(() => {
    localStorage.checkedFilters = JSON.stringify(filters)
  }, [filters])

  return {
    filters,
    filtersArr,
    handleCheck,
    handleSubmit,
    onSubmit,
    register,
    canDelete,
    handleToggleCanDelete,
    handleRemoveFilter,
    isBtnDisabled: !isDirty || !isValid,
    checkedFilters
  }
}

export type RecipeFiltersType = ReturnType<typeof useRecipeFilters>

export function RecipeFilters({
  filtersArr,
  handleSubmit,
  onSubmit,
  filters,
  register,
  handleCheck,
  isBtnDisabled,
  canDelete,
  handleRemoveFilter,
  handleToggleCanDelete
}: RecipeFiltersType) {
  return (
    <div className='mt-2 flex flex-col items-center justify-center gap-2 px-2'>
      <div className='flex items-center gap-2'>
        <h2 className='mb-0 mt-0'>Filters</h2>
        <FunnelIcon />
      </div>

      <div className='flex flex-wrap gap-2'>
        {filtersArr.length > 0 && (
          <button
            onClick={handleToggleCanDelete}
            className={`badge badge-ghost flex h-fit items-center gap-1 py-0`}
          >
            <span>
              {canDelete ? <XIcon size={5} /> : <PencilSquareIcon size={5} />}
            </span>
          </button>
        )}

        {filtersArr.map((filter) => {
          const checked = filters[filter] && !canDelete
          return (
            <button
              onClick={
                canDelete
                  ? () => handleRemoveFilter(filter)
                  : () => handleCheck(filter)
              }
              key={filter}
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
                <span className=''>{filter}</span>
                {canDelete && <XCircleIcon size={5} />}
              </span>
            </button>
          )
        })}
      </div>

      <form className='join' onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('name')}
          className='input-bordered input input-sm join-item'
          placeholder='New filter'
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
