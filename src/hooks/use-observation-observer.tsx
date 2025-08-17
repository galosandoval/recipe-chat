import { useCallback, useEffect, useRef, useState } from 'react'

export function useObervationObserver(options?: IntersectionObserverInit) {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [observation, setObservation] =
    useState<IntersectionObserverEntry | null>(null)

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    setObservation(entries[0])
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(callback, options)
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [callback, options])

  return [elementRef, observation] as const
}
