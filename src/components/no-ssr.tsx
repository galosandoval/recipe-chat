'use client'

import { useEffect, useState } from 'react'

interface NoSsrProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function NoSsr({ children, fallback = null }: NoSsrProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
