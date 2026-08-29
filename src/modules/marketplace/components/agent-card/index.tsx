import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ArrowTopRightIcon } from '@repo/icons/arrow-top-right-icon'
import { CheckIcon } from '@repo/icons/check'
import { DownloadIcon } from '@repo/icons/download'
import { PlusIcon } from '@repo/icons/plus'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { AgentBlob } from '@/modules/core/components/agent-blob'
import { Spinner } from '@/modules/core/components/spinner'
// `ROUTES` is the roster module's today. Importing it across features bends the
// one hard rule in CLAUDE.md; it belongs in `core/constants` alongside
// `ACCOUNT_NAME`, which `thread/constants` has the same note about. Left as one
// import to move rather than a second copy of the literal to keep in step.
import { ROUTES } from '@/modules/roster/constants'
import type { CatalogAgent } from '../../constants/catalog'
import { useInstallAgent } from '../../hooks/use-install-agent'

/**
 * The hover-only slot at the end of the name line.
 *
 * Out of flow until the card is hovered, so the resting card is the quiet one
 * the reference draws — name and tagline across the full width, no CTA, and no
 * width reserved for one. Absolute rather than `hidden` because the button has
 * to stay in the DOM and in the tab order: `group-focus-within` puts it back in
 * the row the moment it takes focus, so a hover affordance is not a keyboard
 * dead end. `inset-y-0 … my-auto` centres it on the name line while it is out of
 * flow, which is exactly where it lands once it is in flow, so the invisible hit
 * area is never somewhere surprising.
 *
 * It returns to flow as `relative`, not `static`: `z-20` is what keeps it above
 * the card-wide overlay link, and `z-index` on a static element does nothing.
 *
 * `pointer-events-none` while it is invisible, because an `opacity-0` button is
 * still hit-testable. On a touch device there is no hover to reveal it first, so
 * without this a tap on the right-hand end of a card hires an agent instead of
 * opening it. Keyboard focus is unaffected — `pointer-events` gates the pointer
 * only, and `group-focus-within` restores it the moment the button is tabbed to.
 */
const HOVER_SLOT =
  'absolute inset-y-0 right-0 z-20 my-auto opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:relative group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:relative group-focus-within:opacity-100'

interface AgentCardProps {
  agent: CatalogAgent
  installed: boolean
}

/**
 * One agent, as the user's reference image draws it: landscape ~2.1:1, the
 * figure top-left and bleeding above the card's top border, name and tagline
 * left-aligned beneath it, and a metadata strip pinned to the bottom on a
 * subtly darker fill.
 *
 * Two token notes, both load-bearing in light mode:
 *
 * - The card is `bg-fill-elevated` and the strip `bg-fill`. §6 names
 *   `bg-fill-secondary` for the card, which is the identical `#212121` in dark —
 *   but in light `bg-fill-secondary` is `#EDEDED` against a `#F7F7F7` strip, so
 *   the strip would come out *lighter* than the card and the "subtly darker"
 *   reading inverts. `bg-fill-elevated` (`#FFF` light) over `bg-fill` (`#F7F7F7`)
 *   holds in both themes and is the same colour as §6 asks for in dark.
 * - `rounded-b-[15px]` on the strip, not `rounded-b-2xl`: the strip sits inside a
 *   1px border, so its radius is the card's 16px minus that border.
 *
 * Height is `aspect-[2.1/1]` with a floor. At the narrow end of the ladder the
 * ratio alone yields a card shorter than its own contents (figure + two text
 * lines + the 40px strip = 152px), and `aspect-ratio` does not grow to fit — it
 * overflows. The floor keeps the ratio between 2.0 and 2.1 everywhere instead of
 * letting the tagline fall through the strip on a phone.
 */
export const AgentCard: FC<AgentCardProps> = ({ agent, installed }) => {
  const install = useInstallAgent(agent)

  // The roster refetch that follows a successful POST tells us the same thing a
  // moment later; reading the mutation too means the card never flashes an
  // Install button at an agent that is already hired.
  const isInstalled = installed || install.isSuccess
  const pinned = install.isPending || install.isError

  // Hermes answers a name collision or a bad slug with a `detail` worth reading.
  // The card is a fixed height, so it borrows the tagline's line rather than
  // growing — `title` carries the full text when it is longer than the card.
  const error = install.isError ? install.error.message || 'Install failed.' : undefined

  return (
    <article className="group relative flex aspect-[2.1/1] min-h-[152px] flex-col rounded-2xl border border-primary bg-fill-elevated hover:border-secondary">
      {/*
        The whole card body is the link to the agent's detail screen, drawn as an
        overlay rather than by wrapping the card: Install is a `button`, and a
        button inside an anchor is invalid HTML that swallows the keyboard.

        The z-order is the load-bearing part and it is a three-way. `z-10` puts
        the link above the name row, which is `relative` (so the button can be
        positioned against it) and would otherwise paint over the link and eat
        the click on the agent's own name. The button then needs `z-20` to sit
        back above the link — it can, because a `relative` element at
        `z-index: auto` is not a stacking context, so its child's z-index still
        competes with the link's.
      */}
      <Link
        to={`${ROUTES.HIRE}/${agent.id}`}
        aria-label={agent.name}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      />

      {/*
        `-top-6` is §6's ~24px bleed above the card's top edge. The shelf grid
        answers it with a 32px row gap so a figure never lands on the card above.
      */}
      <AgentBlob
        profile={agent.id}
        className="pointer-events-none absolute -top-6 left-5 size-20"
      />

      {/* 68px = the figure's 80px, less the 24px it spends above the card, plus a 12px gap. */}
      <div className="flex flex-1 flex-col justify-center px-5 pt-[68px] pb-3">
        <div className="relative flex items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-label-lg font-medium text-primary">
            {agent.name}
          </h3>

          {isInstalled ? (
            <span className="flex shrink-0 items-center gap-1 text-label-sm text-tertiary">
              <CheckIcon className="size-3.5" />
              Installed
            </span>
          ) : (
            <Button
              variant="secondary"
              size="none"
              shape="pill"
              className={cn('h-8 shrink-0 gap-1.5 px-3 text-label-md', HOVER_SLOT, {
                'pointer-events-auto relative opacity-100': pinned,
              })}
              onClick={() => install.mutate()}
              disabled={install.isPending}
              aria-label={`Install ${agent.name}`}
            >
              {install.isPending ? (
                <Spinner className="size-3.5" />
              ) : (
                <PlusIcon className="size-3.5" />
              )}
              {error ? 'Retry' : 'Install'}
            </Button>
          )}
        </div>

        {error ? (
          <p role="alert" title={error} className="truncate text-label-sm text-critical">
            {error}
          </p>
        ) : (
          <p className="truncate text-label-sm text-tertiary">{agent.tagline}</p>
        )}
      </div>

      <div className="flex h-10 shrink-0 items-center justify-between rounded-b-[15px] bg-fill px-5 text-label-sm text-tertiary">
        <span>AI Employee</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ArrowTopRightIcon className="size-3" />
            {agent.runs.toLocaleString()} runs
          </span>
          <span className="flex items-center gap-1">
            <DownloadIcon className="size-3" />
            {agent.installs.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  )
}
