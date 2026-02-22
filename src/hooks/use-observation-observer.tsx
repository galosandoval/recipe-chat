import { useEffect, useRef, useState } from 'react'

export function useObervationObserver(options?: IntersectionObserverInit) {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [observation, setObservation] =
    useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      setObservation(entries[0])
    }, options)
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [options])

  return [elementRef, observation] as const
}
