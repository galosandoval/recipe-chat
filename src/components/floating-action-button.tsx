import { forwardRef, type ComponentProps } from 'react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/button'

/**
 * The visual FAB: a round, shadowed icon button. It owns only its shape and
 * interactive styling — positioning, z-index, and enter/exit animation belong to
 * {@link FabStack}, which renders one of these per registered FAB inside its
 * animated, bottom-anchored column. Never position this directly; register a FAB
 * via `useRegisterFab` instead.
 *
 * Forwards its ref/props so it can serve as an `asChild` trigger (e.g. a
 * dropdown menu) when rendered through a registration's `render`.
 */
export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof Button>
>(({ className, size = 'icon', ...props }, ref) => (
  <Button
    ref={ref}
    size={size}
    className={cn('h-12 w-12 rounded-full shadow-lg', className)}
    {...props}
  />
))

FloatingActionButton.displayName = 'FloatingActionButton'
