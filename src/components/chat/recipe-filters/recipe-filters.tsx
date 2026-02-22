import { useRef, useState } from 'react'
import { type Filter } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { useFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { FilterBadges } from './filter-badges'
import { FilterHeaderAndEditButton } from './recipe-filters-header-and-edit-button.tsx'
import { ActiveCount } from './active-count'
import { CreateFilterForm } from './create-filter-form'

export function FiltersByUser() {
  const { data, status, fetchStatus } = useFiltersByUserId()
  const t = useTranslations()

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }
  if (!data && fetchStatus === 'idle' && status === 'pending') {
    return null
  }

  return <FiltersSection data={data ?? []} />
}

export function FiltersSection({ data }: { data: Filter[] }) {
  const session = useSession()

  const [canDelete, setCanDelete] = useState(false)
  const filterBadgesRef = useRef<HTMLDivElement>(null)

  const toggleCanDelete = () => {
    setCanDelete((prev) => !prev)
  }

  if (session.status !== 'authenticated') {
    return null
  }

  return (
    <section className='flex w-full flex-1 flex-col items-center justify-center'>
      <FilterHeaderAndEditButton
        canDelete={canDelete}
        onToggleCanDelete={toggleCanDelete}
        filterBadgesRef={filterBadgesRef}
      />
      <div className='flex w-full flex-col'>
        <FilterBadges
          canDelete={canDelete}
          containerRef={filterBadgesRef}
          onToggleCanDelete={toggleCanDelete}
        />
        <div className='flex w-full flex-col px-4'>
          <ActiveCount data={data ?? []} />
          <CreateFilterForm />
        </div>
      </div>
    </section>
  )
}
