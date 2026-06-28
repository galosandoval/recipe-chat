'use client'

import { Fade } from '~/components/motion/fade'

/**
 * Route transition. Next.js remounts a `template` (unlike `layout`) on every
 * navigation, so this plays a subtle opacity-only fade as each page enters. The
 * flex classes preserve the `min-h-0 flex-1` chain the page roots rely on.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <Fade className='flex min-h-0 flex-1 flex-col'>{children}</Fade>
}
