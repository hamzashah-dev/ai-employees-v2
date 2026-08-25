import * as Tooltip from '@radix-ui/react-tooltip'
import type { ComponentType, FC } from 'react'
import { Button } from '@/modules/core/components/button'
import {
  ChevronLeftIcon,
  CloseIcon,
  SettingsIcon,
  ShareIcon,
} from '@/modules/core/components/icon'

interface PanelHeaderProps {
  onClose: () => void
}

/**
 * Back, then a spacer, then share / settings / close.
 *
 * Back and close both collapse the drawer: the panel has no nested views to go
 * back to, and a chevron that does nothing is worse than one that does the
 * obvious thing.
 */
export const PanelHeader: FC<PanelHeaderProps> = ({ onClose }) => (
  <Tooltip.Provider delayDuration={200}>
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-[rgb(var(--color-ink-2))] px-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Back to the conversation"
        onClick={onClose}
      >
        <ChevronLeftIcon />
      </Button>

      <div className="flex-1" />

      <UnavailableAction
        icon={ShareIcon}
        label="Share"
        tooltip="Sharing an employee isn’t available yet"
      />
      <UnavailableAction
        icon={SettingsIcon}
        label="Employee settings"
        tooltip="Employee settings aren’t available yet"
      />

      <Button variant="ghost" size="icon" aria-label="Close panel" onClick={onClose}>
        <CloseIcon />
      </Button>
    </header>
  </Tooltip.Provider>
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
 * user.
 */
const UnavailableAction: FC<UnavailableActionProps> = ({
  icon: Icon,
  label,
  tooltip,
}) => (
  <Tooltip.Root>
    {/* A disabled button dispatches no pointer events, so the wrapper hovers. */}
    <Tooltip.Trigger asChild>
      <span className="inline-flex">
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label={`${label} — not available yet`}
        >
          <Icon />
        </Button>
      </span>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        side="bottom"
        sideOffset={6}
        className="z-50 max-w-56 rounded-[12px] border border-[rgb(var(--color-ink-3))] bg-[rgb(var(--color-ink-2))] px-2.5 py-1.5 text-label-sm text-[rgb(var(--color-ink-6))] shadow-[var(--shadow-raised)]"
      >
        {tooltip}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
)
