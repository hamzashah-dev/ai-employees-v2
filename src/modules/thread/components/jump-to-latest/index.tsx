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
      className="pointer-events-auto flex h-8 items-center rounded-full border border-[rgb(var(--color-ink-3))] bg-[rgb(var(--color-ink-1))] px-3.5 text-label-sm text-[rgb(var(--color-ink-6))] shadow-[var(--shadow-raised)] hover:bg-[rgb(var(--color-ink-2))] hover:text-[rgb(var(--color-ink-7))]"
    >
      Jump to latest
    </button>
  </div>
)
