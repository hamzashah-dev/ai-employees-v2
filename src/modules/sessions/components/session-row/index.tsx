import type { FC } from 'react'

interface SessionRowProps {
  title: string
  preview: string
  timeLabel: string
  onOpen: () => void
}

/**
 * One session, §s34's list row minus the two affordances the canvas draws
 * that Hermes cannot back: no per-row "Working now"/"Allow"/"Review" — see
 * `modules/sessions/index.tsx` for why.
 */
export const SessionRow: FC<SessionRowProps> = ({ title, preview, timeLabel, onOpen }) => (
  <li>
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ease-linear hover:bg-fill-variant-hover"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-label-lg font-medium text-primary">{title}</span>
        <span className="shrink-0 text-label-sm text-tertiary">{timeLabel}</span>
      </span>
      {preview && <span className="truncate text-label-md text-tertiary">{preview}</span>}
    </button>
  </li>
)
