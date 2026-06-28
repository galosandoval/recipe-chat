import { useCallback, useState } from 'react'

/**
 * Mirrors a Radix primitive's open state so it can be read in React (for
 * `AnimatePresence`) while keeping the primitive's public controlled/uncontrolled
 * API intact. Supports both modes: when `open` is provided the caller owns the
 * state; otherwise it's tracked internally, seeded from `defaultOpen`.
 *
 * The returned `setOpen` always forwards to `onOpenChange`, so a controlled
 * caller stays the source of truth and an uncontrolled caller still gets notified.
 */
export function useControllableOpen({
  open,
  defaultOpen,
  onOpenChange
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolled

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return [isOpen, setOpen] as const
}
