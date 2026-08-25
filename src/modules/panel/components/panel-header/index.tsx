import type { ComponentType, FC } from 'react'
import { ChevronLeftIcon } from '@repo/icons/chevron-left'
import { CrossIcon } from '@repo/icons/cross'
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
  onClose: () => void
}

/**
 * Back on the left; share, settings and close on the right.
 *
 * Back and close both collapse the drawer: the panel has no nested views to go
 * back to, and a chevron that does nothing is worse than one that does the
 * obvious thing.
 */
export const PanelHeader: FC<PanelHeaderProps> = ({ onClose }) => (
  <header className="flex h-12 shrink-0 items-center justify-between px-3">
    <Button
      variant="icon-ghost"
      size="icon-sm"
      shape="pill"
      className={HEADER_BUTTON}
      aria-label="Back to the conversation"
      onClick={onClose}
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
