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
      'fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg sm:bottom-6 sm:right-6',
      className
    )}
    {...props}
  />
))

FloatingActionButton.displayName = 'FloatingActionButton'
