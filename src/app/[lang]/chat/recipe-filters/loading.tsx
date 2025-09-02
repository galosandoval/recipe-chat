import { useTranslations } from '~/hooks/use-translations'
import { Badge } from '../badge'
import { ValuePropsHeader } from '../value-props'
import { FunnelIcon } from '~/components/icons'
import { ActiveCount } from './active-count'
import { CreateFilterForm } from './create-filter-form'

export function LoadingFilterBadges() {
  const t = useTranslations()
  const loadingBadges = Array.from({ length: 5 }, (_, index) => (
    <Badge
      key={index}
      icon={
        <span className='border-primary h-4 w-4 rounded-full border'></span>
      }
      label='Loading...'
      isLoading
      labelClassName='skeleton h-5 w-24'
    />
  ))
  return (
    <section className='flex w-full flex-1 flex-col items-center justify-center'>
      <ValuePropsHeader icon={<FunnelIcon />} label={t.filters.title} />
      <div className='flex w-full flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4'>
          <p className='text-base-content/80 text-sm'>
            {t.filters.description}
          </p>
        </div>
        <div className='grid h-20 grid-flow-col grid-rows-[min-content] place-items-start justify-start gap-2 overflow-x-scroll px-2'>
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
