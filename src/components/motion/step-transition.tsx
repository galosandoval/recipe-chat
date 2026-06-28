'use client'

import { AnimatePresence, motion } from 'motion/react'
import { durations, ease } from './transitions'

/** Distance (px) a step slides in/out along the horizontal axis. */
const SLIDE = 24

/**
 * Directional step transition for wizard-style flows. The new step fades and
 * slides in from the side that matches travel direction (`forward` = from the
 * right, `back` = from the left), reinforcing progress. Each step must be keyed
 * by a stable value so `AnimatePresence` can run the exit before the enter.
 */
export function StepTransition({
  stepKey,
  direction,
  children
}: {
  stepKey: string | number
  direction: 'forward' | 'back'
  children: React.ReactNode
}) {
  const offset = direction === 'forward' ? SLIDE : -SLIDE

  return (
    <AnimatePresence mode='wait' initial={false} custom={offset}>
      <motion.div
        key={stepKey}
        custom={offset}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -offset }}
        transition={{ duration: durations.base, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
