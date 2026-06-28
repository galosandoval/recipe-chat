'use client'

import { motion } from 'motion/react'
import { fadeRiseTransition, fadeRiseVariants } from './transitions'

/**
 * Content entrance primitive: fades and gently rises into place. Use inside an
 * `<AnimatePresence initial={false}>` so items already present on first mount
 * appear instantly and only newly-arriving items animate — that way the motion
 * signals "new" rather than firing on every re-render.
 */
export function FadeIn({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={fadeRiseVariants}
      initial='hidden'
      animate='visible'
      transition={fadeRiseTransition}
    >
      {children}
    </motion.div>
  )
}
