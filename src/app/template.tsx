'use client'

import { motion } from 'motion/react'
import { durations, ease } from '~/components/motion/transitions'

/**
 * Route transition. Next.js remounts a `template` (unlike `layout`) on every
 * navigation, so this plays a subtle fade as each page enters. The fade is
 * opacity-only on purpose — animating `transform` on this wrapper would break
 * the `sticky`/`fixed` descendants (chat input bar, FAB) mid-transition. The
 * flex classes preserve the `min-h-0 flex-1` chain the page roots rely on.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className='flex min-h-0 flex-1 flex-col'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: durations.base, ease }}
    >
      {children}
    </motion.div>
  )
}
