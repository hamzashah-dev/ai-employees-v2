import type { ComponentType, FC } from 'react'
import { ChevronLeftIcon } from '@repo/icons/chevron-left'
import { CrossIcon } from '@repo/icons/cross'
import { ExitFullViewIcon } from '@repo/icons/exit-full-view'
import { FullViewIcon } from '@repo/icons/full-view'
import { MeetingShareIcon } from '@repo/icons/meeting-share-icon'
import { SettingsIcon } from '@repo/icons/settings'
import { Button } from '@repo/ui/button'
import { WithTooltip } from '@repo/ui/tooltip'

/**
 * The canvas draws these at 32px with a 16px glyph, wider than the shipped
 * header button's 28/20. Expressed through the house `Button` so focus, hover
 * and disabled states stay the product's, with only the box and glyph resized.
 */
const HEADER_BUTTON = 'text-secondary [&>svg]:size-4'

interface PanelHeaderProps {
  /** Pops the view stack. At the root that leaves the drawer; see `usePanelView`. */
  onBack: () => void
  /** Names the destination, which changes with the depth. */
  backLabel: string
  onClose: () => void
  /**
   * Omitted where maximizing is meaningless — below `laptop` the drawer is
   * already a full-height sheet, so there is nothing to maximize into.
   */
  onToggleMaximize?: () => void
  isMaximized?: boolean
}

/**
 * Back on the left; share, settings, maximize and close on the right.
 *
 * Maximize mirrors the shipped artifact drawer's own state rather than being a
 * new full-screen mode: there, `isMaximized` swaps the drawer's width for 100%
 * and drops its resize handle, and the chat column flexes away beside it. Same
 * mechanism here.
 */
export const PanelHeader: FC<PanelHeaderProps> = ({
  onBack,
  backLabel,
  onClose,
  onToggleMaximize,
  isMaximized = false,
}) => (
  <header className="flex h-12 shrink-0 items-center justify-between px-3">
    <Button
      variant="icon-ghost"
      size="icon-sm"
      shape="pill"
      className={HEADER_BUTTON}
      aria-label={backLabel}
      onClick={onBack}
    >
      <ChevronLeftIcon />
    </Button>

    <div className="flex items-center gap-1">
      <UnavailableAction
        icon={MeetingShareIcon}
        label="Share"
        tooltip="Sharing an employee isn’t available yet"
      />
      <UnavailableAction
        icon={SettingsIcon}
        label="Employee settings"
        tooltip="Employee settings aren’t available yet"
      />
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

interface UnavailableActionProps {
  icon: ComponentType<{ className?: string }>
  label: string
  tooltip: string
}

/**
 * A control the backend cannot serve yet.
 *
 * Rendered disabled and explained rather than left live and inert. The reason
 * is repeated in the accessible name because a disabled button never takes
 * focus, so the tooltip alone would never reach a keyboard or screen-reader
 * user. `WithTooltip` wraps its child in the trigger element, which is what
 * makes the hover work at all: a disabled button dispatches no pointer events.
 */
const UnavailableAction: FC<UnavailableActionProps> = ({
  icon: Icon,
  label,
  tooltip,
}) => (
  <WithTooltip
    content={tooltip}
    size="sm"
    showArrow={false}
    className="inline-flex"
    tooltipContentProps={{ side: 'bottom', sideOffset: 6, className: 'max-w-56' }}
  >
    <Button
      variant="icon-ghost"
      size="icon-sm"
      shape="pill"
      className={HEADER_BUTTON}
      disabled
      aria-label={`${label} — not available yet`}
    >
      <Icon />
    </Button>
  </WithTooltip>
)
