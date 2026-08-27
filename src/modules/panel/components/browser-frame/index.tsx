import type { FC } from 'react'
import { CursorIcon } from '@repo/icons/cursor-icon'
import { ExitFullViewIcon } from '@repo/icons/exit-full-view'
import { ExternalLinkIcon } from '@repo/icons/external-link-icon'
import { FullViewIcon } from '@repo/icons/full-view'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'

/**
 * The employee's browser, or the honest absence of it.
 *
 * Two states, and which one you get is decided by whether anything gave us a
 * URL — see `useBrowserView` for why that is normally nothing.
 *
 * The frame is *interactive*, deliberately: camofox launches Camoufox headed on
 * the VNC display and x11vnc attaches with input enabled, so the human's clicks
 * in here and the agent's actions over the tool API land on the same window,
 * the same context and the same cookie jar. That is how a login gets done for
 * the agent rather than around it, so nothing may cover the frame.
 *
 * The live state can still fail *invisibly*. A cross-origin frame reports
 * nothing to the embedder: no load error, no blank-page signal, nothing
 * readable. An unreachable host, a mixed-content block or a container that has
 * since died all render as the same empty rectangle, and this code cannot tell
 * them apart from a working session. So the copy never claims the view is live,
 * and the URL and a real link out are always on screen — that link is the only
 * thing here that works when the frame does not.
 *
 * `#3D3D3D` is `border-tertiary` in the design. This token layer only reaches
 * that neutral as a *fill* through the elevated ramp's active step, hence
 * `bg-fill-elevated-active` on the traffic lights.
 */

/** [width, fill] per bar, exactly as the canvas lays them out. */
const RAIL_BARS = [
  ['w-[70%]', 'bg-fill-elevated-hover'],
  ['w-[90%]', 'bg-fill-elevated'],
  ['w-[60%]', 'bg-fill-elevated'],
  ['w-[80%]', 'bg-fill-elevated'],
  ['w-[65%]', 'bg-fill-elevated'],
] as const

const MAIN_BARS = [
  ['w-[90%]', 'bg-fill-elevated'],
  ['w-[85%]', 'bg-fill-elevated'],
  ['w-[70%]', 'bg-fill-elevated-hover'],
  ['w-[88%]', 'bg-fill-elevated'],
  ['w-[62%]', 'bg-fill-elevated'],
  ['w-[75%]', 'bg-fill-elevated-hover'],
] as const

/**
 * The canvas's own box: 16:10 inside the 480px drawer, and the height the panel
 * overrides when it maximizes. `h-*` stays in the base so a `className` height
 * merges over it rather than fighting it.
 */
/*
 * The frame's own height comes from its ASPECT RATIO, not a fixed pixel value.
 *
 * noVNC scales the remote framebuffer to fit while preserving its aspect ratio,
 * and paints whatever is left over in its own grey. The remote display is
 * 1920x1080 (VNC_RESOLUTION), so any frame that is not 16:9 shows grey bars down
 * the sides or under the page — which reads as "the screen does not fill the
 * box" when nothing is actually wrong. `aspect-video` IS 16/9, so the scaled
 * remote lands exactly on the frame's edges and there is nothing left to paint.
 *
 * Tied to VNC_RESOLUTION by arithmetic, not coincidence: change the container's
 * resolution to something that is not 16:9 and this has to change with it.
 */
const BOX =
  'flex aspect-video w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-primary bg-fill transition-all duration-200 ease-linear'

interface BrowserFrameProps {
  /** noVNC page URL, or null when we have no live view. */
  liveUrl: string | null
  /** True while the agent is running a browser_* tool this turn. */
  agentBrowsing: boolean
  /** Carries the panel's height for this slot; the frame does not choose it. */
  className?: string
  /** True while the drawer is maximized over the conversation. */
  isExpanded?: boolean
  /**
   * Expands the drawer over the conversation, and restores it. Omitted where
   * there is nothing to expand into — below `laptop` the drawer is already a
   * full-height sheet — and the control is then not rendered at all.
   */
  onToggleExpand?: () => void
}

export const BrowserFrame: FC<BrowserFrameProps> = ({
  liveUrl,
  agentBrowsing,
  className,
  isExpanded = false,
  onToggleExpand,
}) => {
  // Only collapsed: expanding is what a click into the frame means, and there
  // is no gesture for the reverse that does not also mean "type in here".

  if (!liveUrl) {
    return (
      <div className={cn(BOX, className)}>
        <Sketch />
        <div className="flex flex-col gap-0.5 border-t border-primary px-2.5 py-2">
          <p className="text-label-sm text-secondary">
            {agentBrowsing ? 'Using a browser — no live view' : 'No live view'}
          </p>
          <p className="text-label-xs text-tertiary">
            Nothing above is a picture of anything: this app has no address for
            this employee’s browser, and no way to tell whether one is open.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(BOX, className)}>
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <iframe
          // No `sandbox`: noVNC is scripts and a WebSocket, so a sandbox without
          // `allow-scripts allow-same-origin` would guarantee the blank frame this
          // component already cannot detect — and with them it grants back what it
          // took. The page is our own container, reached over the local network.
          title="Live view of the browser"
          src={liveUrl}
          className="min-h-0 w-full flex-1 border-0"
        />

        {/*
          Collapsed, the frame is a preview behind a button; expanded, the button
          is gone and every click and keystroke belongs to the frame.

          This started as a focus heuristic — a click into a cross-origin frame
          blurs this window and leaves `activeElement` on the iframe — and that
          does not survive contact with noVNC. Verified against a live container:
          noVNC focuses its own canvas the moment it connects, so the frame
          expanded itself on load with nobody touching it, and by the time a real
          click arrived the window was already blurred, so no further blur ever
          fired and the gesture was dead. A plain button in our own document has
          neither failure, and costs one click to enter the view where the
          signing-in happens.
        */}
        {onToggleExpand && !isExpanded && (
          <button
            type="button"
            aria-label="Open the live view over the conversation"
            className="absolute inset-0 cursor-zoom-in bg-transparent"
            onClick={onToggleExpand}
          />
        )}
      </div>

      {/*
        The way back has to be a control of ours, out here beside the frame.
        Nothing inside the frame can bring us back: its clicks belong to the
        other document, and Escape is no better — noVNC captures keystrokes on
        its own side of the boundary, so the key never reaches this one.
      */}
      <div className="flex flex-col gap-1 border-t border-primary px-2.5 py-2">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-label-xs text-tertiary">
            {liveUrl}
          </span>
          {onToggleExpand && (
            <Button
              variant="ghost"
              size="xs"
              shape="pill"
              className="shrink-0 text-secondary"
              aria-label={
                isExpanded ? 'Exit the enlarged live view' : 'Enlarge the live view'
              }
              onClick={onToggleExpand}
            >
              {isExpanded ? <ExitFullViewIcon /> : <FullViewIcon />}
              {isExpanded ? 'Exit' : 'Enlarge'}
            </Button>
          )}
          <Button asChild variant="ghost" size="xs" shape="pill" className="shrink-0 text-secondary">
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the live view in a new tab"
            >
              <ExternalLinkIcon />
              New tab
            </a>
          </Button>
        </div>
        <p className="text-label-xs text-tertiary">
          {isExpanded
            ? 'Click and type in here to sign in — the agent shares this browser, so the session it leaves behind is the one the agent keeps using.'
            : // Below `laptop` the drawer is already a full-screen sheet, so
              // `onToggleExpand` is undefined and there is no gesture to promise.
              `${onToggleExpand ? 'Click the frame to open it over the conversation and sign in. ' : ''}This app cannot tell whether the frame loaded — open it in a new tab to find out.`}
        </p>
      </div>
    </div>
  )
}

/**
 * The canvas's drawing of a screen, kept as the no-live-view state.
 *
 * `aria-hidden` belongs here, on the drawing, and not on the frame around it:
 * the frame now carries real controls, and hiding their container would take
 * them out of the accessibility tree along with the bars.
 */
const Sketch: FC = () => (
  <div aria-hidden className="relative min-h-0 w-full flex-1 overflow-hidden">
    <div className="flex h-6 items-center gap-1 bg-fill-elevated px-2.5">
      <span className="size-[5px] rounded-full bg-fill-elevated-active" />
      <span className="size-[5px] rounded-full bg-fill-elevated-active" />
      <span className="size-[5px] rounded-full bg-fill-elevated-active" />
      <span className="ml-2 h-2.5 w-[40%] rounded-[5px] bg-fill-elevated-hover" />
    </div>

    <div className="flex h-full">
      <div className="flex w-[90px] flex-col gap-2 border-r border-primary p-2.5">
        {RAIL_BARS.map(([width, fill]) => (
          <span key={width} className={cn('h-1.5 rounded-[3px]', width, fill)} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <span className="h-2 w-[45%] rounded-[4px] bg-fill-elevated-hover" />
        {MAIN_BARS.map(([width, fill]) => (
          <span key={width} className={cn('h-1.5 rounded-[3px]', width, fill)} />
        ))}
      </div>
    </div>

    <CursorIcon className="absolute left-[58%] top-[52%] size-4 text-primary" />
  </div>
)
