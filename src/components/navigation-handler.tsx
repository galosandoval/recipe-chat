'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { navigationStore } from '~/stores/navigation-store'

export const NavigationHandler = () => {
  const pathname = usePathname()
  const endNavigation = navigationStore((state) => state.endNavigation)
  const targetRoute = navigationStore((state) => state.targetRoute)

  useEffect(() => {
    // Reset navigation state when we reach the target route
    if (
      targetRoute &&
      pathname &&
      pathname.includes(targetRoute.split('?')[0])
    ) {
      endNavigation()
    }
  }, [pathname, targetRoute, endNavigation])

  return null
}
