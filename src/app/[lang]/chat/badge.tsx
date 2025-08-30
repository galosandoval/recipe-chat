import { cn } from '~/utils/cn'

export function Badge({
  icon,
  label,
  onClick,
  className,
  labelClassName,
  isLoading
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
  labelClassName?: string
  isLoading?: boolean
}) {
  return (
    <button
      className={cn(
        'bg-base-300 border-base-300 flex h-fit items-center justify-center gap-1 rounded-md border px-2 py-1 text-sm',
        className
      )}
      onClick={onClick}
    >
      {icon}
      <span
        className={cn(
          'text-base-content text-sm whitespace-nowrap',
          labelClassName
        )}
      >
        {isLoading ? null : label}
      </span>
    </button>
  )
}
