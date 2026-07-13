import { create } from 'zustand'
import type { ReactNode } from 'react'

/**
 * One page's declaration of a floating action button. Only `id` and `priority`
 * drive placement; the rest is what {@link FabStack} needs to render the button.
 *
 * `render` is an escape hatch for FABs that aren't a plain icon+click button
 * (e.g. a dropdown-menu trigger that must own the anchored element). When it's
 * present {@link FabStack} renders it instead of the default button, so
 * `ariaLabel`/`icon`/`onClick` are unused for that registration.
 */
export type FabRegistration = {
  /** Stable identity; re-registering the same id replaces the entry in place. */
  id: string
  /** Lower sorts closer to the bottom (thumb); ties break by registration order. */
  priority: number
  ariaLabel?: string
  icon?: ReactNode
  onClick?: () => void
  render?: () => ReactNode
}

type FabStackStore = {
  /** Registered FABs, sorted by priority ascending, ties by registration order. */
  fabs: FabRegistration[]
  register: (fab: FabRegistration) => void
  unregister: (id: string) => void
}

/**
 * Shared coordination for every FAB on screen. A page registers its FAB with a
 * priority instead of picking a `bottom-*` offset; {@link FabStack} lays them
 * out in one bottom-anchored column. Sorting lives here — pure, rendering-free
 * logic — so ordering is testable without touching the animated UI.
 *
 * Colocated with the feature rather than in `~/stores` (see #546), per this
 * repo's keep-code-close-to-where-it's-used convention.
 */
export const useFabStackStore = create<FabStackStore>((set) => ({
  fabs: [],
  register: (fab) =>
    set((s) => {
      const exists = s.fabs.some((f) => f.id === fab.id)
      // Replace in place on re-registration so an equal-priority FAB keeps its
      // registration-order slot; otherwise append. A stable sort then preserves
      // that relative order for ties.
      const next = exists
        ? s.fabs.map((f) => (f.id === fab.id ? fab : f))
        : [...s.fabs, fab]
      return { fabs: [...next].sort((a, b) => a.priority - b.priority) }
    }),
  unregister: (id) => set((s) => ({ fabs: s.fabs.filter((f) => f.id !== id) }))
}))
