import { create } from 'zustand'

/**
 * Whether the two-step "new group" flow is open.
 *
 * It lives in core for the same reason `search-store` does: the trigger and the
 * surface are in different feature modules. The Team heading (roster) opens it;
 * the dialog itself (groups) renders it; neither may import the other, and the
 * shell mounts the dialog once so it can open over any page rather than only
 * over `/groups`.
 */
interface GroupCreateStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useGroupCreateStore = create<GroupCreateStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
