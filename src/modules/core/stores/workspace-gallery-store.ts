import { create } from 'zustand'

/**
 * Which employee's workspace-media gallery (§s23) is open, if any.
 *
 * In core rather than in `modules/workspace` or `modules/panel`: the panel's
 * Workspace section opens it, `modules/workspace` owns the dialog, and a
 * feature module may not reach into another's internals (see CLAUDE.md's
 * "one hard rule"). Mirrors `search-store`'s shape — a store rather than
 * shell state, because the trigger and the dialog sit on opposite sides of
 * the panel/shell split.
 *
 * `profile` doubles as the open flag: `null` means closed, so there is no way
 * for `isOpen` and `profile` to disagree.
 */
interface WorkspaceGalleryStore {
  profile: string | null
  displayName: string | undefined
  open: (profile: string, displayName?: string) => void
  close: () => void
}

export const useWorkspaceGalleryStore = create<WorkspaceGalleryStore>((set) => ({
  profile: null,
  displayName: undefined,
  open: (profile, displayName) => set({ profile, displayName }),
  close: () => set({ profile: null, displayName: undefined }),
}))
