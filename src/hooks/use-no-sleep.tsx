import NoSleep from 'nosleep.js'
import { useEffect } from 'react'

/**
 * This hook is used to prevent the screen from sleeping
 * @returns void
 */
export function useNoSleep() {
  useEffect(() => {
    const noSleep = new NoSleep()
    noSleep.enable()
    return () => {
      noSleep.disable()
    }
  }, [])
}
