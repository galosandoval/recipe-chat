'use client'

import { motion, useReducedMotion } from 'motion/react'
import { fadeRiseTransition, fadeRiseVariants } from './transitions'

/**
 * Scroll-triggered section entrance: fades and gently rises its contents into
 * place the first time the section scrolls into view, then leaves them settled.
 * Unlike {@link FadeIn} (which animates on mount), this waits for the viewport,
 * so it's the primitive the marketing landing sections stack on.
 *
 * Honors `prefers-reduced-motion`: when the user asks for less motion we skip
 * the enter entirely and render the contents at their final, static state — no
 * fade, no rise, nothing waiting on an animation to become visible. This is the
 * app's first reduced-motion handling; later landing sections reuse it.
 */
export function Reveal({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={fadeRiseVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.3 }}
      transition={fadeRiseTransition}
    >
      {children}
    </motion.div>
  )
}
