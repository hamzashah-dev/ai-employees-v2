import type { FC } from 'react'
import { CrossIcon } from '@repo/icons/cross'
import { ExitFullViewIcon } from '@repo/icons/exit-full-view'
import { FullViewIcon } from '@repo/icons/full-view'
import { Button } from '@repo/ui/button'

/**
 * The canvas draws these at 32px with a 16px glyph, wider than the shipped
 * header button's 28/20. Expressed through the house `Button` so focus, hover
 * and disabled states stay the product's, with only the box and glyph resized.
 */
const HEADER_BUTTON = 'text-secondary [&>svg]:size-4'

interface PanelHeaderProps {
  /**
   * What the panel is showing, in two words. "Employee" at rest; the canvas swaps it for
   * "<name> is working" while a turn is in flight, which is the only thing up here that ever
   * changes.
   */
  label: string
  onClose: () => void
  /**
   * Omitted where maximizing is meaningless — below `laptop` the panel is
   * already a full-height sheet, so there is nothing to maximize into.
   */
  onToggleMaximize?: () => void
  isMaximized?: boolean
}

/**
 * A label on the left, maximize and close on the right.
 *
 * Down from five controls to two. The back chevron went with the view stack it popped — the
 * routine editor is a dialog now, so there is nothing behind the panel to go back to except
 * closing it, which the cross already does. Share and Employee-settings went because they
 * were disabled buttons with tooltips explaining that they did nothing: two thirds of the
 * header was controls the backend cannot serve.
 *
 * Maximize mirrors the shipped artifact drawer's own state rather than being a
 * new full-screen mode: there, `isMaximized` swaps the drawer's width for 100%
 * and drops its resize handle, and the chat column flexes away beside it. Same
 * mechanism here.
 */
export const PanelHeader: FC<PanelHeaderProps> = ({
  label,
  onClose,
  onToggleMaximize,
  isMaximized = false,
}) => (
  <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-3">
    <span className="min-w-0 truncate pl-1 text-label-sm text-secondary">{label}</span>

    <div className="flex shrink-0 items-center gap-1">
      {onToggleMaximize && (
        <Button
          variant="icon-ghost"
          size="icon-sm"
          shape="pill"
          className={HEADER_BUTTON}
          aria-label={isMaximized ? 'Restore split view' : 'Maximize panel'}
          onClick={onToggleMaximize}
        >
          {isMaximized ? <ExitFullViewIcon /> : <FullViewIcon />}
        </Button>
      )}
      <Button
        variant="icon-ghost"
        size="icon-sm"
        shape="pill"
        className={HEADER_BUTTON}
        aria-label="Close panel"
        onClick={onClose}
      >
        <CrossIcon />
      </Button>
    </div>
  </header>
)
