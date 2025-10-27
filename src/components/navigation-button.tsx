'use client'

import { useRouter } from 'next/navigation'
import type { ButtonProps } from './ui/button'
import { navigationStore } from '~/stores/navigation-store'
import type { ComponentType } from 'react'

interface NavigationButtonProps extends Omit<ButtonProps, 'onClick'> {
  href: string
  onClick?: () => void | Promise<void>
  isLoading?: boolean
  icon?: React.ReactNode
  as?: ComponentType<any>
  [key: string]: any
}

export const NavigationButton = ({
  href,
  onClick,
  children,
  className = '',
  disabled = false,
  as: Component,
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

  const finalClassName = `${className} disabled:cursor-wait disabled:opacity-50`
  const finalDisabled = disabled || isNavigating

  // If no custom component, use button as default
  if (!Component) {
    return (
      <button
        type='button'
        onClick={handleClick}
        disabled={finalDisabled}
        className={finalClassName}
        {...props}
      >
        {children}
      </button>
    )
  }

  // Render custom component with all necessary props
  return (
    <Component
      onClick={handleClick}
      disabled={finalDisabled}
      className={finalClassName}
      {...props}
    >
      {children}
    </Component>
  )
}
