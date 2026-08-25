import type { FC } from 'react'
import { ArrowTopRightIcon } from '@repo/icons/arrow-top-right-icon'
import { DownloadIcon } from '@repo/icons/download'
import { PlusIcon } from '@repo/icons/plus'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { AgentBlob } from '@/modules/core/components/agent-blob'
import { Spinner } from '@/modules/core/components/spinner'
import type { CatalogAgent } from '../../constants/catalog'
import { useInstallAgent } from '../../hooks/use-install-agent'

/**
 * The hover-only slot at the end of the text row.
 *
 * Out of flow until the card is hovered, so the resting card is the quiet one the
 * canvas draws — name and blurb across the full width, no CTA, and no width
 * reserved for one. Absolute rather than `hidden` because the button has to stay
 * in the DOM and in the tab order: `group-focus-within` puts it back in the row
 * the moment it takes focus, so a hover affordance is not a keyboard dead end.
 * It is positioned where it lands once static, so the invisible hit area is never
 * somewhere surprising.
 */
const HOVER_SLOT =
  'absolute right-4 bottom-[52px] opacity-0 group-hover:static group-hover:opacity-100 group-focus-within:static group-focus-within:opacity-100'

interface AgentCardProps {
  agent: CatalogAgent
  installed: boolean
}

export const AgentCard: FC<AgentCardProps> = ({ agent, installed }) => {
  const install = useInstallAgent(agent)

  // The roster refetch that follows a successful POST tells us the same thing a
  // moment later; reading the mutation too means the card never flashes an
  // Install button at an agent that is already hired.
  const isInstalled = installed || install.isSuccess
  const pinned = install.isPending || install.isError

  // Hermes answers a name collision or a bad slug with a `detail` worth reading.
  // The card is a fixed 336 tall, so it borrows the blurb's line rather than
  // growing — `title` carries the full text when it is longer than the card.
  const error = install.isError ? install.error.message || 'Install failed.' : undefined

  return (
    <article className="group relative flex h-[336px] flex-col rounded-2xl border border-primary bg-fill-elevated hover:border-secondary">
      <div className="relative h-[172px]">
        <AgentBlob
          profile={agent.id}
          className="absolute -top-6 left-1/2 -ml-[75px] size-[150px]"
        />
      </div>

      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-label-lg font-medium text-primary">{agent.name}</h3>
          {error ? (
            <p role="alert" title={error} className="truncate text-label-sm text-critical">
              {error}
            </p>
          ) : (
            <p className="truncate text-label-sm text-tertiary">{agent.tagline}</p>
          )}
        </div>

        {isInstalled ? (
          <span className={cn('shrink-0 text-label-sm text-tertiary', HOVER_SLOT)}>
            Installed
          </span>
        ) : (
          <Button
            variant="tertiary"
            size="none"
            className={cn(
              'h-8 shrink-0 gap-1.5 rounded-2xl px-3 text-label-md',
              HOVER_SLOT,
              { 'static opacity-100': pinned },
            )}
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

      <div className="mt-auto flex h-10 items-center justify-between rounded-b-[15px] bg-fill px-4 text-label-sm text-tertiary">
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
