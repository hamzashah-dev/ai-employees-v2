import type { ComponentType, FC, ReactElement } from 'react'
import { CursorAutoSelectIcon } from '@repo/icons/cursor-auto-select-icon'
import { ExternalLinkIcon } from '@repo/icons/external-link-icon'
import { PauseIcon } from '@repo/icons/pause'
import { Button } from '@repo/ui/button'
import { WithTooltip } from '@repo/ui/tooltip'
import { Spinner } from '@/modules/core/components/spinner'
import { useScreenActions } from './hooks/use-screen-actions'

interface ScreenActionsProps {
  profile: string
  displayName: string
}

/**
 * The strip under the maximized screen: take over, pause, open in new tab.
 *
 * One of the three is real and two are not, and they are drawn differently for
 * exactly that reason.
 *
 * **Pause** stops the turn that is running. `session.interrupt` is a real
 * gateway method (`tui_gateway/server.py:9614`), the session manager already
 * speaks it, and the composer's stop button is the same call — so this is wired,
 * and disabled only when there is no turn to stop.
 *
 * **Take over** and **Open in new tab** are not, and cannot be faked. There is
 * no screen behind `ScreenPreview`: Hermes exposes no VNC, no framebuffer, no
 * screenshot stream and no per-employee URL — `computer_cli/web_server.py` has
 * no such route at all. A live-looking button that quietly did nothing would be
 * worse than a disabled one that says why.
 */
export const ScreenActions: FC<ScreenActionsProps> = ({ profile, displayName }) => {
  const { canStop, isStopping, stop } = useScreenActions(profile)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill
        icon={CursorAutoSelectIcon}
        label="Take over"
        reason="Hermes has no remote screen to take over — there is no VNC or framebuffer endpoint behind this preview."
      />

      <Pill
        icon={PauseIcon}
        label="Pause"
        pending={isStopping}
        reason={canStop ? undefined : `${displayName} isn’t running anything right now`}
        onClick={stop}
      />

      <Pill
        icon={ExternalLinkIcon}
        label="Open in new tab"
        reason="There is no URL for an employee’s screen — Hermes serves no standalone view of it."
      />
    </div>
  )
}

interface PillProps {
  icon: ComponentType<{ className?: string }>
  label: string
  /** Present means "disabled, and this is why". Absent means the control works. */
  reason?: string
  pending?: boolean
  onClick?: () => void
}

/**
 * A ghost pill that is either live or disabled-and-explained.
 *
 * The reason goes in *both* the tooltip and the accessible name, and the button
 * is wrapped rather than given a `title`, because neither route works alone on a
 * disabled control: a disabled button dispatches no pointer events, so Chrome
 * never renders its native `title` and a tooltip bound to the button itself
 * would never open — `WithTooltip` puts the trigger on a wrapper, which does get
 * the hover — and it never takes focus, so a screen reader would otherwise never
 * reach the explanation at all.
 */
const Pill: FC<PillProps> = ({ icon: Icon, label, reason, pending = false, onClick }) => {
  const disabled = reason !== undefined || pending

  const button: ReactElement = (
    <Button
      variant="ghost"
      size="sm"
      shape="pill"
      className="text-secondary [&>svg]:size-4"
      disabled={disabled}
      aria-label={reason ? `${label} — ${reason}` : label}
      onClick={onClick}
    >
      {pending ? <Spinner /> : <Icon />}
      {label}
    </Button>
  )

  if (!reason) return button

  return (
    <WithTooltip
      content={reason}
      size="sm"
      showArrow={false}
      className="inline-flex"
      tooltipContentProps={{ side: 'top', sideOffset: 6, className: 'max-w-64' }}
    >
      {button}
    </WithTooltip>
  )
}
