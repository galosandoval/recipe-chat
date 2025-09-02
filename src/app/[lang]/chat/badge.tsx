import type { ComponentProps } from 'react'
import { Badge as BadgeUI } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

export function Badge({
  icon,
  label,
  onClick,
  className,
  labelClassName,
  isLoading,
  variant
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
  labelClassName?: string
  isLoading?: boolean
  variant?: ComponentProps<typeof BadgeUI>['variant']
}) {
  return (
    <BadgeUI
      className={cn('gap-1', className)}
      variant={variant}
      onClick={onClick}
    >
      {icon && <div className='size-5'>{icon}</div>}
      <span
        className={cn(
          'text-base-content text-sm whitespace-nowrap',
          labelClassName
        )}
      >
        {isLoading ? null : label}
      </span>
    </BadgeUI>
  )
}
