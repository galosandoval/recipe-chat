'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '~/stores/navigation-store'

export const NavigationHandler = () => {
  const pathname = usePathname()
  
  useEffect(() => {
    const { endNavigation, targetRoute } = useNavigationStore.getState()
    // Reset navigation state when we reach the target route
    if (
      targetRoute &&
      pathname &&
      pathname.includes(targetRoute.split('?')[0])
    ) {
      endNavigation()
    }
  }, [pathname])

  return null
}
