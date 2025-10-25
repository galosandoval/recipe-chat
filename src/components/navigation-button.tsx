'use client'

import { useRouter } from 'next/navigation'
import type { ButtonProps } from './ui/button'
import { navigationStore } from '~/stores/navigation-store'

interface NavigationButtonProps extends Omit<ButtonProps, 'onClick'> {
  href: string
  onClick?: () => void | Promise<void>
  isLoading?: boolean
  icon?: React.ReactNode
}

export const NavigationButton = ({
  href,
  onClick,
  children,
  className = '',
  disabled = false,
  ...props
}: NavigationButtonProps) => {
  const router = useRouter()
  const isNavigating = navigationStore((state) => state.isNavigating)
  const startNavigation = navigationStore((state) => state.startNavigation)
  const endNavigation = navigationStore((state) => state.endNavigation)

  const handleClick = async () => {
    if (disabled || isNavigating) return

    startNavigation(href)

    try {
      // Execute optional pre-navigation callback
      if (onClick) {
        await onClick()
      }

      // Navigate to the new route
      router.push(href)
    } catch (error) {
      console.error('Navigation error:', error)
      endNavigation()
    }
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={disabled || isNavigating}
      className={`${className} disabled:cursor-wait disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  )
}
