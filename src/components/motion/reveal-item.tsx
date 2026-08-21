'use client'

import { motion } from 'motion/react'
import { fadeRiseTransition, fadeRiseVariants } from './transitions'

/**
 * One step of a {@link Reveal}'s entrance. Rises in with the same fade as its
 * parent Reveal but on its own `delay`, so a group of siblings arrives one after
 * another instead of all at once.
 *
 * It has no viewport trigger of its own — Motion propagates the parent Reveal's
 * variant down, so every item animates off the single moment the section enters
 * view. That's the difference from nesting Reveals: items far down a one-column
 * phone layout still arrive in order, rather than each waiting to be scrolled to.
 *
 * Only meaningful inside a Reveal; on its own it renders static (and, like
 * Reveal, carries `data-reveal` for the reduced-motion rule in globals.css).
 */
export function RevealItem({
  children,
  className,
  delay
}: {
  children: React.ReactNode
  className?: string
  /** Seconds after the section's entrance begins before this item rises in. */
  delay?: number
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={fadeRiseVariants}
      transition={{ ...fadeRiseTransition, delay }}
    >
      {children}
    </motion.div>
  )
}
