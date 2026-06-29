'use client'

/**
 * Re-exported from Motion so feature components manage enter/exit presence
 * through the motion module instead of importing `motion/react` directly. This
 * keeps the library behind a single seam that's easy to wrap or swap later.
 */
export { AnimatePresence } from 'motion/react'
