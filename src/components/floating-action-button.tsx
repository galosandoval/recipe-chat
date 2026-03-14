import { forwardRef, type ComponentProps } from 'react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/button'

export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof Button>
>(({ className, size = 'icon', ...props }, ref) => (
  <Button
    ref={ref}
    size={size}
    className={cn(
      'fixed right-4 bottom-20 z-40 h-12 w-12 rounded-full shadow-lg sm:right-6 sm:bottom-6',
      className
    )}
    {...props}
  />
))

FloatingActionButton.displayName = 'FloatingActionButton'
