import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { CrossIcon } from '@repo/icons/cross'
import { GlobeIcon } from '@repo/icons/globe-icon'
import { cn } from '@repo/ui/cn'
import type { ToolCall } from '@/modules/core/types/chat'
import { BrowserFrame } from '../browser-frame'

interface BrowserDockProps {
  /** noVNC page URL, or null when we have no live view — the usual case. */
  liveUrl: string | null
  /** True while a `browser_*` tool is running this turn. */
  agentBrowsing: boolean
  /** This turn's browser calls, oldest first. */
  steps: ToolCall[]
  /** True while the panel is maximized over the conversation. */
  isExpanded: boolean
  /** Maximizes the panel and restores it. Omitted below `laptop`, where the panel is a sheet. */
  onToggleExpand?: () => void
}

/**
 * The employee's browser session, docked at the foot of the panel.
 *
 * It exists only while there is a session to report: a `browser_*` call in flight, or an
 * address left behind by one. The panel drew a browser permanently before this — a 16:10
 * wireframe with a fake cursor in it, captioned "nothing above is a picture of anything",
 * which was the largest thing on a surface about an employee who was, almost always, not
 * browsing at all.
 *
 * Two states, decided by whether anything gave us an address:
 *
 * - **No live view** — the common one. `liveUrl` rides on a `browser_navigate` tool *result*
 *   (see `useBrowserView`), so it is null until the first navigation of a session completes
 *   and stays null for any browser tool that is not camofox-backed. What is real is the list
 *   of calls the agent made, each with the label Hermes itself wrote for it, so that is what
 *   is drawn. No screenshot, no invented progress, no address we do not have.
 * - **Live view** — the frame, unchanged, in `BrowserFrame`. Interactive on purpose: the
 *   human's clicks and the agent's actions land on the same window and the same cookie jar,
 *   which is how a login gets done *for* the agent rather than around it.
 *
 * There are no per-step timestamps because there are none to have: `tool.start` carries no
 * time and the store keeps none. The design's "0:42" would have to be invented.
 */
export const BrowserDock: FC<BrowserDockProps> = ({
  liveUrl,
  agentBrowsing,
  steps,
  isExpanded,
  onToggleExpand,
}) => (
  <div className="flex shrink-0 flex-col border-t border-primary p-4">
    <section
      aria-label="Browser session"
      className="flex flex-col overflow-hidden rounded-2xl border border-secondary bg-fill"
    >
      {liveUrl ? (
        /* The frame brings its own header strip, URL and controls, so the card's own header
           would be a second copy of what is already inside it. */
        <BrowserFrame
          liveUrl={liveUrl}
          agentBrowsing={agentBrowsing}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          className="rounded-none border-0"
        />
      ) : (
        <>
          <header className="flex items-center justify-between gap-2 px-3.5 py-3">
            <span className="flex min-w-0 items-center gap-2">
              <GlobeIcon className="size-4 shrink-0 text-secondary" />
              <span className="text-label-md text-primary">Browser</span>
            </span>
            <span
              className={cn(
                'inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full bg-fill-elevated px-2.5 text-label-xs',
                { 'text-success': agentBrowsing, 'text-tertiary': !agentBrowsing },
              )}
            >
              {agentBrowsing && (
                <span aria-hidden className="size-1.5 rounded-full bg-fill-success" />
              )}
              {/* The card only exists during a session, so the quiet state is a gap between
                  two calls, not a browser that has closed — nothing here knows that it has. */}
              {agentBrowsing ? 'Running' : 'Idle'}
            </span>
          </header>

          {steps.length > 0 && (
            <ul className="flex flex-col gap-0.5 px-3.5 pb-3">
              {steps.map((step) => (
                <li key={step.id} className="flex items-center gap-3 py-[3px]">
                  <StepGlyph status={step.status} />
                  <span
                    className={cn('min-w-0 flex-1 truncate text-label-md', {
                      'text-primary': step.status === 'running',
                      'text-tertiary': step.status !== 'running',
                    })}
                  >
                    {/* Hermes' own `tool.start.context` — "Opening ads.google.com" — with the
                        machine name as the fallback it is not supposed to need. */}
                    {step.label?.trim() || step.name}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-0.5 border-t border-primary px-3.5 py-2.5">
            <p className="text-label-sm text-secondary">Using a browser — no live view</p>
            <p className="text-label-xs text-tertiary">
              This app has no address for this employee’s browser, and no way to tell whether
              one is open. The steps above are the tool calls it reported.
            </p>
          </div>
        </>
      )}
    </section>
  </div>
)

/**
 * Where a step got to.
 *
 * `failed` is only ever reached through the orphan reaper — `tool.complete` carries no
 * success flag — so it means "the turn ended without this reporting back", not "the browser
 * refused". The glyph says stopped, and nothing here says why.
 */
const StepGlyph: FC<{ status: ToolCall['status'] }> = ({ status }) => {
  if (status === 'running') {
    return (
      <span
        aria-hidden
        className="flex size-4 shrink-0 items-center justify-center"
      >
        <span className="size-2 animate-pulse rounded-full bg-fill-success" />
      </span>
    )
  }
  if (status === 'failed') return <CrossIcon className="size-4 shrink-0 text-tertiary" />
  return <CheckIcon className="size-4 shrink-0 text-secondary" />
}
