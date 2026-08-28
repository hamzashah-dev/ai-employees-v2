import type { ComponentType, FC, ReactElement, ReactNode } from 'react'
import { CursorAutoSelectIcon } from '@repo/icons/cursor-auto-select-icon'
import { ExternalLinkIcon } from '@repo/icons/external-link-icon'
import { PauseIcon } from '@repo/icons/pause'
import { Button } from '@repo/ui/button'
import { WithTooltip } from '@repo/ui/tooltip'
import { Spinner } from '@/modules/core/components/spinner'
import { useBrowserView } from '../../hooks/use-browser-view'
import { useScreenActions } from './hooks/use-screen-actions'

interface ScreenActionsProps {
  profile: string
  displayName: string
}

/** The canvas's pill: the house `Button` with the strip's own glyph size. */
const PILL = 'text-secondary [&>svg]:size-4'

/**
 * The strip under the maximized screen: take over, pause, open in new tab.
 *
 * They are drawn differently because they are not equally real.
 *
 * **Pause** stops the turn that is running. `session.interrupt` is a real
 * gateway method (`tui_gateway/server.py:9614`), the session manager already
 * speaks it, and the composer's stop button is the same call — so this is wired,
 * and disabled only when there is no turn to stop.
 *
 * **Open in new tab** is a live link the moment anything hands us a URL, and
 * disabled-and-explained until then. `vnc_url` rides on a `browser_navigate`
 * result, so it is genuinely absent until the agent's first navigation and for
 * any employee whose browser is not camofox-backed. See `useBrowserView`.
 *
 * **Take over** stays a label rather than a control, but not because there is
 * nothing behind it: the live view IS the take-over. The agent's browser and
 * the user's are one window on one shared display, so clicking into the frame
 * is the entire gesture and a button would only be inventing a mode switch.
 * What it must not do is what it used to — deny a remote screen exists while
 * one is running two inches above it.
 */
export const ScreenActions: FC<ScreenActionsProps> = ({ profile, displayName }) => {
  const { canStop, isStopping, stop } = useScreenActions(profile)
  const { liveUrl } = useBrowserView(profile)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill
        icon={CursorAutoSelectIcon}
        label="Take over"
        reason={
          liveUrl
            ? 'The live view above is the take-over — click into the frame and type. It is the same browser window the agent is driving, so a sign-in you do there is one it keeps.'
            : 'There is no live view to take over yet — nothing has handed this app an address for this employee’s browser.'
        }
      />

      <Pill
        icon={PauseIcon}
        label="Pause"
        pending={isStopping}
        reason={canStop ? undefined : `${displayName} isn’t running anything right now`}
        onClick={stop}
      />

      {/* A URL or a reason, never both — see `PillProps.href`. */}
      <Pill
        icon={ExternalLinkIcon}
        label="Open in new tab"
        {...(liveUrl
          ? { href: liveUrl }
          : {
              reason:
                'There is no URL for an employee’s screen — Hermes serves no standalone view of it.',
            })}
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
  /**
   * Makes the pill an anchor instead of a button, through the house `Button`'s
   * `asChild` slot rather than a second component. Mutually exclusive with
   * `reason`: a link we can offer is by definition not a control we cannot.
   */
  href?: string
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
const Pill: FC<PillProps> = ({
  icon: Icon,
  label,
  reason,
  pending = false,
  href,
  onClick,
}) => {
  const disabled = reason !== undefined || pending

  const face: ReactNode = (
    <>
      {pending ? <Spinner /> : <Icon />}
      {label}
    </>
  )

  // `disabled` is deliberately not forwarded to the anchor branch: there is no
  // such attribute on `<a>`, and an anchor only exists here when there is a
  // real URL to follow.
  const button: ReactElement = href ? (
    <Button variant="ghost" size="sm" shape="pill" className={PILL} asChild>
      <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
        {face}
      </a>
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      shape="pill"
      className={PILL}
      disabled={disabled}
      aria-label={reason ? `${label} — ${reason}` : label}
      onClick={onClick}
    >
      {face}
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
