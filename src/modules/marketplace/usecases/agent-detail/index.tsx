import type { FC, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangleIcon } from '@repo/icons/alert-triangle'
import { CheckIcon } from '@repo/icons/check'
import { PlayIcon } from '@repo/icons/play'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui/dialog'
import { WithTooltip } from '@repo/ui/tooltip'
import { AgentBlob } from '@/modules/core/components/agent-blob'
import { Spinner } from '@/modules/core/components/spinner'
import { ROUTES } from '@/modules/roster/constants'
import { AVAILABLE_CATALOG, type CatalogAgent } from '../../constants/catalog'
import type { Connector } from '../../constants/connectors'
import { RequirementRow } from './components/requirement-row'
import { useAgentDetail } from './hooks/use-agent-detail'

const PREVIEW_TOOLTIP =
  'There is no dry run to show. Hermes can only run an agent that exists, on its own computer — nothing in its REST surface simulates a run.'

const CONNECTOR_NOTE =
  'Whether these are connected is not something this build can tell you: Hermes keeps no connector store. What an agent actually gets is the keys below.'

/**
 * D17 — the agent detail surface, at `/employees/hire/:agentKey`.
 *
 * Mounted alongside the grid rather than in place of it, so the panel sits over
 * a dimmed marketplace exactly as the artboard draws it. `Dialog` portals, which
 * is why the mount point in the route does not matter and why Esc, the overlay
 * click and the focus trap all come for free.
 *
 * Split in two because the hooks below cannot run for an agent that does not
 * exist, and an unknown `:agentKey` is a reachable URL.
 */
export const AgentDetailView: FC = () => {
  const { agentKey } = useParams<{ agentKey: string }>()
  const agent = AVAILABLE_CATALOG.find(({ id }) => id === agentKey)

  if (!agent) return <UnknownAgent agentKey={agentKey} />

  return <AgentDetailPanel agent={agent} />
}

const AgentDetailPanel: FC<{ agent: CatalogAgent }> = ({ agent }) => {
  const {
    employed,
    justHired,
    hire,
    isHiring,
    hireError,
    summary,
    envError,
    progress,
    focusName,
    close,
    openThread,
  } = useAgentDetail(agent)

  const held = justHired && summary.held

  const footer = (
    <footer className="flex flex-wrap items-center gap-3 border-t border-secondary bg-fill px-6 py-4">
      {employed ? (
        <Button variant="primary" size="sm" onClick={openThread}>
          Open thread
        </Button>
      ) : (
        <Button variant="primary" size="sm" onClick={hire} disabled={isHiring}>
          {isHiring && <Spinner className="size-3.5" />}
          {hireError ? 'Try again' : 'Hire'}
        </Button>
      )}

      <WithTooltip
        content={PREVIEW_TOOLTIP}
        size="sm"
        showArrow={false}
        className="inline-flex"
        tooltipContentProps={{
          side: 'top',
          sideOffset: 6,
          className: 'max-w-64',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled
          aria-label="Preview a run — not available in this build"
        >
          <PlayIcon />
          Preview a run
        </Button>
      </WithTooltip>

      <p className="ml-auto text-label-sm text-tertiary">
        {agent.runs.toLocaleString()} runs · {agent.installs.toLocaleString()} installs
      </p>

      {hireError && (
        <p role="alert" className="w-full text-label-sm text-critical">
          {hireError}
        </p>
      )}
    </footer>
  )

  return (
    <Panel onClose={close} footer={footer}>
      <div className="flex items-start gap-4 px-6 pt-6">
        <AgentBlob profile={agent.id} size={64} className="size-16 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-heading-sm font-medium text-primary">
              {agent.name}
            </DialogTitle>
            <Badge variant="neutral-strong" size="md" className="rounded-full">
              {agent.category}
            </Badge>
          </div>
          <DialogDescription className="text-body-md text-secondary">
            {agent.tagline}
          </DialogDescription>
        </div>
        <DialogCloseButton className="shrink-0" />
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        {held && (
          <HeldReceipt agentName={agent.name} focusName={focusName} progress={progress} />
        )}

        {agent.duties && (
          <Block title="What it does">
            <ul className="flex flex-col gap-2">
              {agent.duties.map((duty) => (
                <li key={duty} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-tertiary" />
                  <span className="text-body-sm text-secondary">{duty}</span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {agent.connectors && (
          <Block title="Connects to">
            <div className="flex flex-wrap gap-2">
              {agent.connectors.map((connector) => (
                <ConnectorChip key={connector.id} connector={connector} />
              ))}
            </div>
            {/*
              §6 asks for a per-chip connected / Connect state. There is nothing
              to read it from, and a chip that offered Connect four times over
              would be four dead controls; the one live affordance a connector
              row has lives in "Needs from you", disabled and explained. This
              line is the honest replacement for the per-chip state.
            */}
            <p className="text-label-sm text-tertiary">{CONNECTOR_NOTE}</p>
          </Block>
        )}

        {summary.rows.length > 0 && (
          <Block title="Needs from you">
            {envError && (
              <p role="alert" className="text-label-sm text-critical">
                Could not read what {agent.name} already has — {envError} The rows below
                show what it asks for, not what it is missing.
              </p>
            )}
            <ul className="flex flex-col">
              {summary.rows.map((row) => (
                <RequirementRow
                  key={row.requirement.name}
                  row={row}
                  profile={agent.id}
                  editable={employed}
                  autoFocus={held && row.requirement.name === focusName}
                />
              ))}
            </ul>
            {progress && !held && (
              <p className="text-label-sm text-tertiary">{progress}</p>
            )}
          </Block>
        )}

        {agent.howItWorks && (
          <Block title="How it works">
            <ul className="flex flex-col gap-1.5">
              {agent.howItWorks.map((line) => (
                <li key={line} className="text-body-sm text-tertiary">
                  {line}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {!agent.duties && !agent.connectors && !agent.howItWorks && (
          <p className="text-body-sm text-tertiary">
            This agent has no published detail yet. Hiring it still works — it creates the
            employee and opens its thread, where you can tell it what you need.
          </p>
        )}
      </div>
    </Panel>
  )
}

/**
 * D18 — hired, and held.
 *
 * The wording is load-bearing. The employee exists: `POST /api/profiles`
 * returned, the roster row is already there. Nothing about this is a failure,
 * and the copy must never let it read as one.
 */
const HeldReceipt: FC<{
  agentName: string
  focusName?: string
  progress?: string
}> = ({ agentName, focusName, progress }) => (
  <div
    role="status"
    className="flex items-start gap-3 rounded-xl bg-surface-warning px-4 py-3"
  >
    <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0 text-warning" />
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="text-label-md text-warning">
        {agentName} is hired and already on your roster.
      </p>
      <p className="text-label-sm text-warning">
        {focusName
          ? `It is held until ${focusName} is added below.`
          : 'It is held until the rest of what it needs is added below.'}
      </p>
      {progress && <p className="text-label-sm text-warning">{progress}</p>}
    </div>
  </div>
)

const ConnectorChip: FC<{ connector: Connector }> = ({ connector }) => (
  <span className="flex items-center gap-2 rounded-xl bg-fill-tertiary px-3 py-1.5 text-label-sm text-secondary">
    <connector.Icon className="size-4 shrink-0" />
    {connector.label}
  </span>
)

const Block: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-2.5">
    <h3 className="text-label-md font-medium text-tertiary">{title}</h3>
    {children}
  </section>
)

const UnknownAgent: FC<{ agentKey?: string }> = ({ agentKey }) => {
  const navigate = useNavigate()

  return (
    <Panel onClose={() => navigate(ROUTES.EMPLOYEES)}>
      <div className="flex flex-col gap-2 p-6">
        <DialogTitle className="text-heading-sm font-medium text-primary">
          No such agent
        </DialogTitle>
        <DialogDescription className="text-body-md text-secondary">
          {agentKey
            ? `Nothing in the catalogue is called “${agentKey}”.`
            : 'Pick an agent from the catalogue.'}
        </DialogDescription>
      </div>
    </Panel>
  )
}

/**
 * §2 pins modals at a 20px radius, which no Tailwind step matches — `rounded-2xl`
 * is 16 and `rounded-3xl` is 24. The dialog's own default is `max-w-lg` and
 * `p-4`; this surface is wide and pads per block, so both are overridden.
 *
 * The scroll belongs to the body, not to the panel: this content runs past a
 * 900px viewport, and scrolling the whole panel took D17's `Hire` footer off
 * the bottom of the screen — the surface that decides a hire, with its decision
 * out of reach.
 *
 * `bg-fill-elevated` rather than the dialog's own `bg-surface-variant`, for the
 * reason the marketplace card records: in dark `bg-surface-variant` and the
 * footer's `bg-fill` are the same `#171717`, so the footer would disappear. The
 * card/panel pairing (`#212121` over `#171717`, `#FFF` over `#F7F7F7`) holds in
 * both themes.
 */
const Panel: FC<{
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}> = ({ onClose, footer, children }) => (
  <Dialog open onOpenChange={(next) => !next && onClose()}>
    <DialogContent className="flex max-h-[calc(100vh-6rem)] w-[calc(100vw-2rem)] max-w-[720px] flex-col gap-0 overflow-hidden rounded-[20px] bg-fill-elevated p-0">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer}
    </DialogContent>
  </Dialog>
)
