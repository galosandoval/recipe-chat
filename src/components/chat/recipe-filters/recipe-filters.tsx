import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { useFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { FilterBadges } from './filter-badges'
import { FilterIcon } from 'lucide-react'
import { ManageFiltersDialog } from './manage-filters-dialog'
import { SectionHeader } from '../section-header'

export function FiltersByUser() {
  const { data, status, fetchStatus } = useFiltersByUserId()
  const t = useTranslations()

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }
  if (!data && fetchStatus === 'idle' && status === 'pending') {
    return null
  }

  return <FiltersSection />
}

export function FiltersSection() {
  const session = useSession()

  if (session.status !== 'authenticated') {
    return null
  }

  return (
    <section className='flex w-full flex-1 flex-col items-center justify-center'>
      <FilterHeaderAndEditButton />
      <div className='w-full px-4'>
        <FilterBadges />
      </div>
    </section>
  )
}

function FilterHeaderAndEditButton() {
  const t = useTranslations()

  return (
    <SectionHeader
      label={t.filters.title}
      icon={<FilterIcon size={16} />}
      actionComp={<ManageFiltersDialog />}
    />
  )
}
