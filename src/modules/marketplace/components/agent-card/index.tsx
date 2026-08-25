import type { FC } from 'react'
import { Button } from '@/modules/core/components/button'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { cn } from '@/modules/core/utils/cn'
import type { CatalogAgent } from '../../constants/catalog'
import { useInstallAgent } from '../../hooks/use-install-agent'

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

  // Install is a hover affordance, but work in flight and a failure that needs
  // reading are not — those stay on screen wherever the pointer goes.
  const pinned = install.isPending || install.isError

  return (
    <article
      className={cn(
        'group relative flex h-full w-full flex-col',
        'rounded-[16px] border border-[rgb(var(--color-ink-2))] bg-[rgb(var(--color-ink-1))]',
        'px-5 pt-8 pb-5',
      )}
    >
      <EmployeeAvatar profile={agent.id} size={150} className="-mt-[24px] self-center" />

      <h3 className="mt-4 line-clamp-1 text-center text-label-md font-medium text-[rgb(var(--color-ink-7))]">
        {agent.name}
      </h3>
      <p className="mt-2 line-clamp-2 min-h-[32px] text-center text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">
        {agent.tagline}
      </p>

      <div className="mt-auto flex items-center justify-between pt-5 text-label-xs text-[rgb(var(--color-ink-7)/0.5)]">
        <span>AI Employee</span>
        <span>{agent.runs.toLocaleString()} runs</span>
      </div>

      <div className="mt-4 flex h-8 items-center justify-center">
        {isInstalled ? (
          <span className="text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">Installed</span>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className={cn(
              'w-full',
              !pinned && 'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
            )}
            onClick={() => install.mutate()}
            disabled={install.isPending}
            aria-label={`Install ${agent.name}`}
          >
            {install.isPending ? 'Installing…' : 'Install'}
          </Button>
        )}
      </div>

      {install.error ? (
        <p role="alert" className="mt-3 text-label-sm text-[rgb(var(--color-danger))]">
          {install.error.message || 'Install failed.'}
        </p>
      ) : null}
    </article>
  )
}
