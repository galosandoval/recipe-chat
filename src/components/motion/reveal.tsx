'use client'

import { motion } from 'motion/react'
import { fadeRiseTransition, fadeRiseVariants } from './transitions'

/** What starts the entrance: the viewport, or the enclosing Reveal's own. */
const viewportTrigger = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.3 }
} as const

/**
 * Scroll-triggered section entrance: fades and gently rises its contents into
 * place the first time the section scrolls into view, then leaves them settled.
 * Unlike {@link FadeIn} (which animates on mount), this waits for the viewport,
 * so it's the primitive the marketing landing sections stack on.
 *
 * `prefers-reduced-motion` is honored in CSS, not here — the `[data-reveal]`
 * rule in globals.css carries it, and the comment there explains why it can't
 * live in JS.
 */
export function Reveal({
  children,
  className,
  delay,
  trigger = 'viewport'
}: {
  children: React.ReactNode
  className?: string
  /** Seconds to hold before rising in — how sibling Reveals stagger. */
  delay?: number
  /**
   * `viewport` (the default) waits to be scrolled to. `parent` has no trigger
   * of its own: Motion propagates the enclosing Reveal's variant down, so a
   * group of siblings arrives off the section's single entrance instead of each
   * one waiting for the scroll to reach it — which is what keeps a stagger in
   * order down a one-column phone layout.
   */
  trigger?: 'viewport' | 'parent'
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={fadeRiseVariants}
      {...(trigger === 'viewport' ? viewportTrigger : {})}
      transition={{ ...fadeRiseTransition, delay }}
    >
      {children}
    </motion.div>
  )
}
