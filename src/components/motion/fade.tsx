'use client'

import { motion } from 'motion/react'
import { durations, ease } from './transitions'

/**
 * Opacity-only entrance. Unlike {@link FadeIn} it animates no transform, so it's
 * safe to wrap content that has `sticky`/`fixed` descendants (e.g. the route
 * template's chat input bar / FAB) where an animated transform on the ancestor
 * would break their positioning mid-transition.
 */
export function Fade({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: durations.base, ease }}
    >
      {children}
    </motion.div>
  )
}
