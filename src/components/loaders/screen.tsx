import { cn } from '~/lib/utils'
import { LoadingSpinner } from './loading-spinner'

export function ScreenLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 grid place-items-center',
        'screen-loader-fade-in opacity-0 backdrop-blur-sm',
        'pt-[4.8rem]',
        className
      )}
    >
      <LoadingSpinner className='spinner-fade-in opacity-0' />
    </div>
  )
}
