import { cn } from '~/lib/utils'
import { LoadingSpinner } from './loading-spinner'

export function ScreenLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 grid place-items-center',
        'opacity-0 screen-loader-fade-in backdrop-blur-sm',
        'pt-[4.8rem]',
        className
      )}
    >
      <LoadingSpinner className='opacity-0 spinner-fade-in' />
    </div>
  )
}