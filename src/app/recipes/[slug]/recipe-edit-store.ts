import { create } from 'zustand'

type RecipeEditStore = {
  /** Whether the Recipe detail is showing the edit form instead of the reading view. */
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
}

/**
 * Shared edit-mode flag for the Recipe detail page. The Navbar's edit control and
 * the recipe body render in separate subtrees of the root layout (siblings under
 * `Providers`), so a plain `useState` can't span both. This tiny store lets the
 * Navbar toggle edit mode while `RecipeById` reacts to it.
 *
 * Colocated with the Recipe detail feature rather than in `~/stores` (see #546),
 * mirroring `useFabStackStore`'s keep-code-close-to-its-consumer convention.
 */
export const useRecipeEditStore = create<RecipeEditStore>((set) => ({
  isEditing: false,
  setIsEditing: (isEditing) => set({ isEditing })
}))
