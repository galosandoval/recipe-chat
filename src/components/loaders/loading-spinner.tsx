import { LoaderCircleIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <LoaderCircleIcon
      size={40}
      className={cn('text-primary animate-spin', className)}
    />
  )
}
