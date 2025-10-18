import { cn } from '~/lib/utils'
import { LoadingSpinner } from './loading-spinner'

export function ScreenLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn('inset-0 z-50 h-svh bg-transparent pt-[4.7rem]', className)}
    >
      <div className='bg-background grid h-full w-full place-items-center'>
        <LoadingSpinner />
      </div>
    </div>
  )
}