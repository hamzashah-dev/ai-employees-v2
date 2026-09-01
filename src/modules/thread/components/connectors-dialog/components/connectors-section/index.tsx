import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { cn } from '@repo/ui/cn'
import { Spinner } from '@/modules/core/components/spinner'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'
import { useMcpServers } from '@/modules/core/hooks/use-mcp-servers'
import { SectionLabel } from '@/modules/core/components/section-label'
import { connectorIcon, hasBrandIcon } from '../../utils/connector-icon'
import { describeConnector, summariseConnectors } from '../../utils/connector-state'

interface ConnectorsSectionProps {
  profile: string
}

/**
 * The outside systems this employee can reach — which in Hermes means its MCP servers.
 *
 * Backed by `GET /api/mcp/servers?profile=…` and `PUT …/{name}/enabled`, both real and both
 * profile-scoped. Two things the design asks for are not in that payload:
 *
 * 1. **Brand icons.** `_mcp_server_summary` returns name, transport, url, command, args,
 *    env, auth, enabled and tools. There is no icon, no logo and no vendor id, so the mark
 *    is matched off the *name* — see `utils/connector-icon`. A server the library has no
 *    mark for keeps the generic glyph rather than being given a guessed one.
 * 2. **Sign-in state.** `auth` says how a server authenticates, never whether it *has*.
 *    Only `POST …/{name}/test` knows, and it finds out by opening a live connection.
 */
export const ConnectorsSection: FC<ConnectorsSectionProps> = ({ profile }) => {
  const { servers, isLoading, error, toggle, pendingName } = useMcpServers(profile)

  return (
    <section aria-label="Connectors" className="flex flex-col gap-0.5">
      <SectionLabel
        action={
          servers.length > 0 ? (
            <span className="text-label-xs text-tertiary">
              {summariseConnectors(servers)}
            </span>
          ) : undefined
        }
      >
        MCP servers
      </SectionLabel>

      {isLoading && (
        <p className="flex items-center gap-2 py-2 text-label-md text-secondary">
          <Spinner />
          Loading connectors…
        </p>
      )}

      {error && (
        <p role="alert" className="py-2 text-label-md text-critical">
          {error.message}
        </p>
      )}

      {!isLoading && !error && servers.length === 0 && (
        <p className="py-2 text-label-md text-tertiary">
          No MCP servers are configured for this employee. Adding one is a Hermes dashboard
          job — this app has no surface for it.
        </p>
      )}

      <ul className="flex flex-col">
        {servers.map((server) => (
          <ConnectorRow
            key={server.name}
            server={server}
            isPending={pendingName === server.name}
            onToggle={() => toggle(server)}
          />
        ))}
      </ul>

      {servers.length > 0 && (
        <p className="pt-2 text-label-xs text-tertiary">
          Hermes reads these when a turn starts, so a change applies to the next message.
        </p>
      )}
    </section>
  )
}

interface ConnectorRowProps {
  server: HermesMcpServer
  isPending: boolean
  onToggle: () => void
}

const ConnectorRow: FC<ConnectorRowProps> = ({ server, isPending, onToggle }) => {
  const { detail, needsOAuth } = describeConnector(server)
  const Icon = connectorIcon(server.name)

  return (
    <li className="flex items-center gap-3 py-2">
      {/* A brand mark carries its own colours; the generic glyph is a `currentColor`
          stroke and has to be tinted by the row. Painting both the same way makes one of
          them wrong — the tint would flatten Slack's four hues to grey. */}
      <Icon
        className={cn('size-5 shrink-0', {
          'stroke-[1.125] text-secondary': !hasBrandIcon(server.name),
        })}
      />

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-label-md text-primary">{server.name}</span>
        <span className="truncate text-label-xs text-tertiary">{detail}</span>
        {needsOAuth && (
          <span className="truncate text-label-xs text-warning">Needs OAuth sign-in</span>
        )}
      </span>

      <button
        type="button"
        aria-pressed={server.enabled}
        aria-label={
          server.enabled ? `Turn off ${server.name}` : `Turn on ${server.name}`
        }
        disabled={isPending}
        onClick={onToggle}
        className={cn(
          'inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] px-2',
          'text-label-sm whitespace-nowrap outline-none transition-colors',
          'hover:bg-fill-variant-hover focus-visible:ring-2 focus-visible:ring-primary',
          'disabled:cursor-default disabled:text-disabled',
          { 'text-success': server.enabled, 'text-secondary': !server.enabled },
        )}
      >
        {isPending ? (
          <Spinner />
        ) : (
          <>
            {server.enabled && <CheckIcon className="size-3.5 stroke-[1.6px]" />}
            {server.enabled ? 'On' : 'Turn on'}
          </>
        )}
      </button>
    </li>
  )
}
