import { useEffect } from 'react'
import { useFabStackStore, type FabRegistration } from './fab-stack-store'

/**
 * Declares a FAB for as long as the calling component is mounted. Registers on
 * mount (and whenever a field changes), unregisters on unmount — so mounting or
 * unmounting the caller is the same act as adding or removing its FAB, and any
 * existing show/hide logic (e.g. a `if (isNewChat) return null` guard) keeps
 * working with no separate cleanup step.
 *
 * This is the only surface a call site touches; no page reads the store or
 * {@link FabStack} directly.
 */
export function useRegisterFab(registration: FabRegistration) {
  const register = useFabStackStore((s) => s.register)
  const unregister = useFabStackStore((s) => s.unregister)
  const { id, priority, ariaLabel, icon, onClick, render } = registration

  useEffect(() => {
    register({ id, priority, ariaLabel, icon, onClick, render })
  }, [register, id, priority, ariaLabel, icon, onClick, render])

  useEffect(() => {
    return () => unregister(id)
  }, [unregister, id])
}
