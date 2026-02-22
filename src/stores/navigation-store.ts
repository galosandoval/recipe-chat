import { create } from 'zustand'

type NavigationStore = {
  // UI State
  isNavigating: boolean
  targetRoute: string | null

  // Actions
  setNavigating: (isNavigating: boolean, targetRoute?: string) => void
  startNavigation: (targetRoute: string) => void
  endNavigation: () => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  // Initial state
  isNavigating: false,
  targetRoute: null,

  // Actions
  setNavigating: (isNavigating: boolean, targetRoute?: string) =>
    set({ isNavigating, targetRoute: targetRoute || null }),

  startNavigation: (targetRoute: string) =>
    set({ isNavigating: true, targetRoute }),

  endNavigation: () => set({ isNavigating: false, targetRoute: null })
}))
