import { create } from 'zustand'

type TasteProfileDrawerStore = {
  isOpen: boolean
  open: () => void
  close: () => void
  setOpen: (open: boolean) => void
}

/**
 * Open state for the taste-profile quiz overlay. The quiz no longer lives at its
 * own route; any trigger (first-run auto-open, the "edit taste profile" menu
 * entry, the chat welcome links) flips this so the single mounted
 * `TasteProfileDrawer` shows the quiz where the user already is.
 */
export const useTasteProfileDrawerStore = create<TasteProfileDrawerStore>(
  (set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    setOpen: (isOpen) => set({ isOpen })
  })
)
