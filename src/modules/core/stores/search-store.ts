import { create } from 'zustand'

/**
 * Whether the employee search modal is up.
 *
 * In core rather than in either feature that touches it: the sidebar's `Search`
 * row opens it (§4.2 — "a **button**, not a link") and the search module owns
 * the dialog, and a feature module may not reach into another's internals.
 *
 * A store rather than shell state because the trigger and the surface sit on
 * opposite sides of the layout, and threading a callback down through the
 * sidebar body, its nav list and every row is a lot of plumbing for one boolean.
 */
interface SearchStore {
  isOpen: boolean
  open: () => void
  close: () => void
  setOpen: (isOpen: boolean) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (isOpen) => set({ isOpen }),
}))
