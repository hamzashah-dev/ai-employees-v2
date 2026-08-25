import type { FC } from 'react'

interface JumpToLatestProps {
  onClick: () => void
}

/**
 * Shown only while the reader has scrolled away from the newest message. The
 * thread never scrolls itself in that state, so this is the way back.
 */
export const JumpToLatest: FC<JumpToLatestProps> = ({ onClick }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto flex h-8 cursor-pointer items-center rounded-full border border-secondary bg-fill-elevated px-3.5 text-label-sm text-secondary shadow-xs hover:bg-fill-elevated-hover hover:text-primary"
    >
      Jump to latest
    </button>
  </div>
)
