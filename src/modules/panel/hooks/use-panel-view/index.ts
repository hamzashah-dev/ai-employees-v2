import { useCallback, useState } from 'react'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'

/**
 * Which of the drawer's views is on top, as a stack rather than a flag.
 *
 * `PanelHeader` used to document that its back chevron simply closed the drawer,
 * because there was nothing behind it. There is now — the routine editor — and
 * "back" has to mean two different things depending on where you are. A stack
 * says that once: back pops, and popping the last view leaves the drawer, which
 * is exactly the old behaviour at depth 1 and the new one at depth 2. A boolean
 * would have to be re-read at every call site, and a third view would need a
 * second boolean.
 */

export type PanelView =
  | { name: 'routines' }
  | { name: 'editor'; job: HermesCronJob | null }

export interface PanelViewState {
  view: PanelView
  /** The chevron's accessible name — it names where it goes, not where it is. */
  backLabel: string
  back: () => void
  /** With a job, edits it; without, starts a new routine. */
  openEditor: (job?: HermesCronJob) => void
}

const ROOT: PanelView = { name: 'routines' }

export function usePanelView(onClose: () => void): PanelViewState {
  const [stack, setStack] = useState<PanelView[]>([ROOT])
  const view = stack[stack.length - 1] ?? ROOT

  // `onClose` is called here rather than inside the `setStack` updater: an
  // updater is not allowed side effects and React invokes it twice under
  // StrictMode, which would close the drawer's parent state twice.
  const back = useCallback(() => {
    if (stack.length <= 1) {
      onClose()
      return
    }
    setStack((current) => current.slice(0, -1))
  }, [onClose, stack.length])

  const openEditor = useCallback((job?: HermesCronJob) => {
    setStack((current) => [...current, { name: 'editor', job: job ?? null }])
  }, [])

  return {
    view,
    backLabel: stack.length > 1 ? 'Back to routines' : 'Back to the conversation',
    back,
    openEditor,
  }
}
