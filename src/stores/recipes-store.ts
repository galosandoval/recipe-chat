import { create } from 'zustand'

type RecipesStore = {
  // UI State
  search: string
  setSearch: (search: string) => void
}

export const recipesStore = create<RecipesStore>((set) => ({
  // Initial state
  search: '',
  setSearch: (search: string) => set({ search })
}))
