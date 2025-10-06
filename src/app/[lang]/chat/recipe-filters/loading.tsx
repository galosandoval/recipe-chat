import { useTranslations } from '~/hooks/use-translations'
import { ValuePropsHeader } from '../value-props'
import { ActiveCount } from './active-count'
import { CreateFilterForm } from './create-filter-form'
import { Skeleton } from '~/components/ui/skeleton'
import { FunnelIcon } from 'lucide-react'

export function LoadingFilterBadges() {
  const t = useTranslations()
  const loadingBadges = Array.from({ length: 4 }, (_, index) => (
    <Skeleton className='bg-primary h-6 w-24 rounded-md' key={index} />
  ))
  return (
    <section className='flex w-full flex-1 flex-col items-center justify-center'>
      <ValuePropsHeader icon={<FunnelIcon />} label={t.filters.title} />
      <div className='flex w-full flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4'>
          <p className='text-foreground/80 text-sm'>{t.filters.description}</p>
        </div>
        <div className='flex flex-wrap justify-start gap-2 overflow-x-scroll px-2'>
          {loadingBadges}
        </div>
        <div className='flex w-full flex-col px-4'>
          <ActiveCount data={[]} />
          <CreateFilterForm disabled />
        </div>
      </div>
    </section>
  )
}
