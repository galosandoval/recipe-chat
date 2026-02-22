import { create } from 'zustand'

type RecipesStore = {
  // UI State
  search: string
  setSearch: (search: string) => void
}

export const useRecipesStore = create<RecipesStore>((set) => ({
  // Initial state
  search: '',
  setSearch: (search: string) => set({ search })
}))
