import { cn } from '~/utils/cn'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('loading loading-spinner text-primary', className)}
    ></span>
  )
}
