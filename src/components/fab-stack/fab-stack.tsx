'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { AnimatePresence } from '~/components/motion/animate-presence'
import { durations, ease } from '~/components/motion/transitions'
import { FloatingActionButton } from '~/components/floating-action-button'
import { useFabStackStore } from './fab-stack-store'

/**
 * The route-entrance delay, mirroring the value {@link FloatingActionButton}
 * used to bake in: on a fresh navigation the stack waits for the route
 * transition to settle, then pops in, so a `fixed` FAB never reads as dragging.
 */
const ROUTE_ENTRANCE_DELAY = 0.45
/** How long a navigation keeps applying that delay before add/remove goes fast. */
const ROUTE_ENTRANCE_WINDOW_MS = (ROUTE_ENTRANCE_DELAY + durations.base) * 1000

/**
 * The single, shared FAB renderer. Mounted once in the root layout (a sibling of
 * `BottomNav`/`AppFooter`, deliberately outside `RouteTransition` so the column
 * is never dragged by the route transform). Reads {@link useFabStackStore} and
 * lays every registered FAB out in one bottom-anchored `flex-col-reverse`
 * column, ordered by priority. Each item is a `motion.div` with `layout` inside
 * `AnimatePresence`, so adding, removing, or re-prioritizing a FAB reflows the
 * survivors into their new slot with no manual offset math.
 *
 * Owns all positioning (fixed placement, z-index, column layout); the button
 * itself keeps only its visual styling.
 */
export function FabStack() {
  const fabs = useFabStackStore((s) => s.fabs)
  const pathname = usePathname()

  // A fresh navigation makes the newly-registered FABs wait for the route
  // transition; anything toggled later in the same page session animates
  // immediately (no artificial delay).
  const [enterDelay, setEnterDelay] = useState(ROUTE_ENTRANCE_DELAY)
  useEffect(() => {
    setEnterDelay(ROUTE_ENTRANCE_DELAY)
    const timer = setTimeout(() => setEnterDelay(0), ROUTE_ENTRANCE_WINDOW_MS)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className='fixed right-4 bottom-20 z-40 flex w-fit flex-col-reverse items-end gap-3 sm:right-6 sm:bottom-6'>
      <AnimatePresence>
        {fabs.map((fab) => (
          <motion.div
            key={fab.id}
            layout
            className='w-fit'
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: durations.base, ease, delay: enterDelay }
            }}
            exit={{
              opacity: 0,
              scale: 0.6,
              transition: { duration: durations.fast, ease }
            }}
            transition={{ layout: { duration: durations.base, ease } }}
          >
            {fab.render ? (
              fab.render()
            ) : (
              <FloatingActionButton
                aria-label={fab.ariaLabel}
                onClick={fab.onClick}
              >
                {fab.icon}
              </FloatingActionButton>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
