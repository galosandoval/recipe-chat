import { Skeleton } from '~/components/ui/skeleton'
import { CircleIcon } from 'lucide-react'

export function LoadingFilterBadges() {
  const loadingBadges = Array.from({ length: 4 }, (_, index) => (
    <div
      key={index}
      className='bg-background border-border mr-2 mb-2 flex h-[26px] items-center justify-between gap-2 rounded-md border px-3 py-1'
    >
      <CircleIcon className='text-primary size-5' />
      <Skeleton
        className='bg-foreground h-2'
        style={{ width: `calc(6rem - ${Math.abs(index - 2) * 10}px)` }}
      />
    </div>
  ))
  return (
    <div className='flex flex-wrap justify-start px-2'>{loadingBadges}</div>
  )
}
