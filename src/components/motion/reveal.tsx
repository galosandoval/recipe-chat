'use client'

import { motion } from 'motion/react'
import { fadeRiseTransition, fadeRiseVariants } from './transitions'

/**
 * Scroll-triggered section entrance: fades and gently rises its contents into
 * place the first time the section scrolls into view, then leaves them settled.
 * Unlike {@link FadeIn} (which animates on mount), this waits for the viewport,
 * so it's the primitive the marketing landing sections stack on.
 *
 * Honors `prefers-reduced-motion` in CSS rather than JS — the `data-reveal` rule
 * in globals.css pins the contents at their final, static state. That has to be
 * CSS: `useReducedMotion` can only answer on the client, so the server renders
 * the hidden state as inline `opacity: 0` either way, and React leaves that
 * attribute in place when a static branch hydrates over it. Branching in JS left
 * the section permanently invisible for exactly the visitors it protects. The
 * enter still runs for them, unseen and pinned; nothing waits on it to appear.
 */
export function Reveal({
  children,
  className,
  delay
}: {
  children: React.ReactNode
  className?: string
  /** Seconds to hold before rising in — how sibling Reveals stagger. */
  delay?: number
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={fadeRiseVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.3 }}
      transition={{ ...fadeRiseTransition, delay }}
    >
      {children}
    </motion.div>
  )
}
