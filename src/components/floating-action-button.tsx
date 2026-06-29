import { forwardRef, type ComponentProps } from 'react'
import { motion } from 'motion/react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/button'
import { durations, ease } from '~/components/motion/transitions'

/**
 * Fixed FAB with a staggered entrance: the wrapper stays hidden (opacity 0)
 * until the route transition has finished, then pops the button in. The delay is
 * deliberately longer than {@link RouteTransition}'s duration for two reasons: it
 * reads as "the page settles, then the action appears", and it hides the fact
 * that a `fixed` element is dragged by RouteTransition's transform mid-navigation
 * — by the time the FAB becomes visible, that transform is gone and it sits at
 * its real viewport position.
 *
 * Positioning/animation live on the wrapper; the button keeps its shape and
 * interactive styles. Caller `className` (positioning overrides like `bottom-36`)
 * targets the wrapper, since that's the `fixed` element.
 */
export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof Button>
>(({ className, size = 'icon', ...props }, ref) => (
  <motion.div
    className={cn(
      'fixed right-4 bottom-20 z-40 w-fit sm:right-6 sm:bottom-6',
      className
    )}
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.45, duration: durations.base, ease }}
  >
    <Button
      ref={ref}
      size={size}
      className='h-12 w-12 rounded-full shadow-lg'
      {...props}
    />
  </motion.div>
))

FloatingActionButton.displayName = 'FloatingActionButton'
