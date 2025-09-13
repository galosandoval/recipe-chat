import { cn } from '~/lib/utils'

export function GlassElement({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('glass-background', className)}>{children}</div>
}
