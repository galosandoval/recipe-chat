'use client'

import { usePathname } from 'next/navigation'
import type { ButtonProps } from './ui/button'
import { useNavigationStore } from './navigation-store'
import type { ComponentType } from 'react'
import { useAppRouter } from '~/hooks/use-app-router'

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
  const router = useAppRouter()
  const pathname = usePathname()
  const isNavigating = useNavigationStore((state) => state.isNavigating)
  const startNavigation = useNavigationStore((state) => state.startNavigation)
  const endNavigation = useNavigationStore((state) => state.endNavigation)

  const handleClick = async () => {
    if (disabled || isNavigating) return

    if (pathname === href) {
      if (onClick) await onClick()
      return
    }

    startNavigation(href)

    try {
      if (onClick) await onClick()
      router.push(href)
    } catch (error) {
      console.error('Navigation error:', error)
      endNavigation()
    }
  }

  // If no custom component, use button as default
  if (!Component) {
    return (
      <button
        type='button'
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </button>
    )
  }

  // Render custom component with all necessary props
  return (
    <Component onClick={handleClick} className={className} {...props}>
      {children}
    </Component>
  )
}
