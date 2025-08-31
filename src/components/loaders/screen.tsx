import { cn } from '~/lib/utils'
import { LoadingSpinner } from './loading-spinner'

export function ScreenLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn('fixed inset-0 z-50 h-svh bg-transparent pt-8', className)}
    >
      <div className='bg-base-100 grid h-full w-full place-items-center'>
        <LoadingSpinner />
      </div>
    </div>
  )
}
