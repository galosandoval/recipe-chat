import { cn } from '~/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('loading loading-spinner text-primary', className)}
    ></span>
  )
}
