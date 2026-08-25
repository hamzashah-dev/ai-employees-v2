import type { FC } from 'react'
import { toDisplayName } from '@/modules/core/utils/identity'
import { EmployeeSummary } from './components/employee-summary'
import { PanelHeader } from './components/panel-header'
import { ResizeHandle } from './components/resize-handle'
import { RoutinesSection } from './components/routines-section'
import { PANEL_WIDTH_DEFAULT } from './constants'
import { usePanelWidth } from './hooks/use-panel-width'

export interface EmployeePanelProps {
  profile: string
  onClose: () => void
}

/**
 * The employee drawer.
 *
 * A sibling of the thread rather than an overlay: it takes its width out of the
 * layout, so the conversation reflows beside it and nothing is ever covered.
 * The width lives here — the shell does not need to know it.
 */
export const EmployeePanel: FC<EmployeePanelProps> = ({ profile, onClose }) => {
  const { width, setWidth } = usePanelWidth()

  return (
    <aside
      aria-label={`${toDisplayName(profile)} details`}
      className="relative flex h-full shrink-0 flex-col border-l border-[rgb(var(--color-ink-2))] bg-[rgb(var(--color-ink-1))]"
      // Untouched, the drawer is exactly the token width; a drag replaces it.
      style={{ width: width == null ? 'var(--spacing-panel)' : `${width}px` }}
    >
      <ResizeHandle width={width ?? PANEL_WIDTH_DEFAULT} onResize={setWidth} />
      <PanelHeader onClose={onClose} />

      <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto">
        <EmployeeSummary profile={profile} />
        <RoutinesSection profile={profile} />
      </div>
    </aside>
  )
}
