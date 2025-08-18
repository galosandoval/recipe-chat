import { cn } from '~/utils/cn'

export function GlassElement({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('glass-element', className)}>{children}</div>
}
