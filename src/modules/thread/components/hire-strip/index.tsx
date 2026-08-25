import { useState, type FC } from 'react'
import { useLocation } from 'react-router-dom'
import { CheckIcon } from '@repo/icons/check'
import { CrossIcon } from '@repo/icons/cross'
import { Button } from '@repo/ui/button'

/**
 * D19 — the completion beat, above the transcript.
 *
 * The sentence arrives as router state (`navigate(to, { state: { hired } })`),
 * not as a prop or an import. The marketplace composes it from the agent's own
 * operating defaults; this module may not reach into another feature's
 * constants, and router state has the right lifetime anyway — it evaporates on
 * reload, which is what a one-time confirmation should do.
 *
 * Renders nothing when there is no such state, so the mount site is a bare
 * `<HireStrip />` with no condition around it.
 */
export const HireStrip: FC = () => {
  const { state } = useLocation()
  const [dismissed, setDismissed] = useState(false)

  const hired = (state as { hired?: unknown } | null)?.hired
  const line = typeof hired === 'string' && hired.trim() ? hired : undefined

  if (!line || dismissed) return null

  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-[768px] items-center gap-2 rounded-xl bg-surface-success px-3 py-2 text-success"
    >
      <CheckIcon className="size-3.5 shrink-0" />
      <p className="min-w-0 flex-1 text-label-md">{line}</p>
      <Button
        variant="icon-ghost"
        size="icon-xs"
        shape="pill"
        className="shrink-0 text-success"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
      >
        <CrossIcon />
      </Button>
    </div>
  )
}
