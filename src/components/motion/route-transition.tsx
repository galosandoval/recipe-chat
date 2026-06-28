'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { durations, ease } from './transitions'

/**
 * Single home for route-to-route animation. Lives in the persistent layout but
 * is keyed on the pathname, so each navigation remounts this subtree and fades
 * the entering route in. Opacity-only — animating transform here would fight the
 * `sticky`/`fixed` chrome inside pages.
 *
 * Enter-only by design: no `AnimatePresence`/exit. With an exit, the leaving
 * clone keeps rendering the *new* `children` (the prop updates the instant you
 * navigate), so the destination content would flash in, fade out, then fade
 * back in. Keying a plain `motion.div` removes the old route instantly and fades
 * the new one in from 0, with nothing painting it at full opacity first.
 *
 * Relies on there being no `loading.tsx` in the route's ancestor chain: without
 * a Suspense fallback the navigation waits for the new route's data before
 * committing, so this mounts with real content (which then fades) rather than an
 * empty shell that pops once data streams in.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      className='flex min-h-0 flex-1 flex-col'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: durations.base, ease }}
    >
      {children}
    </motion.div>
  )
}
