import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { Button } from '@repo/ui/button'
import { WithTooltip } from '@repo/ui/tooltip'
import { Spinner } from '@/modules/core/components/spinner'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'
import { useConnectors } from '@/modules/thread/hooks/use-connectors'
import { SectionLabel } from '../section-label'
import { describeConnector, summariseConnectors } from '../../utils/connector-state'

interface ConnectorsSectionProps {
  profile: string
}

/**
 * The outside systems this employee can reach — which in Hermes means its MCP servers.
 *
 * Backed by `GET /api/mcp/servers?profile=…` and `PUT …/{name}/enabled`, both real and both
 * profile-scoped. Two things the design asks for are not in that payload and are not
 * invented here:
 *
 * 1. **Brand icons.** `_mcp_server_summary` returns name, transport, url, command, args,
 *    env, auth, enabled and tools. There is no icon, no logo and no vendor id to look one
 *    up by, so every row carries the same generic connector glyph.
 * 2. **Sign-in state.** `auth` says how a server authenticates, never whether it *has*.
 *    Only `POST …/{name}/test` knows, and it finds out by opening a live connection.
 */
export const ConnectorsSection: FC<ConnectorsSectionProps> = ({ profile }) => {
  const { servers, isLoading, error, toggle, pendingName } = useConnectors(profile)

  return (
    <section aria-label="Connectors" className="flex flex-col gap-1">
      <SectionLabel
        action={
          servers.length > 0 ? (
            <span className="text-label-xs text-tertiary">
              {summariseConnectors(servers)}
            </span>
          ) : undefined
        }
      >
        Connectors
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
        <p className="pt-1 text-label-xs text-tertiary">
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

  return (
    <li className="flex items-center gap-3 py-2">
      {/* Generic on purpose: Hermes serves no brand mark for an MCP server. */}
      <ConnectorsIcon className="size-5 shrink-0 stroke-[1.125] text-secondary" />

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-label-md text-primary">{server.name}</span>
        <span className="truncate text-label-xs text-tertiary">{detail}</span>
        {needsOAuth && (
          <span className="truncate text-label-xs text-warning">Needs OAuth sign-in</span>
        )}
      </span>

      {needsOAuth && <SignInAction name={server.name} />}

      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-pressed={server.enabled}
        disabled={isPending}
        onClick={onToggle}
        className="shrink-0"
      >
        {isPending ? (
          <Spinner />
        ) : server.enabled ? (
          <>
            <CheckIcon className="text-success" />
            <span className="sr-only">Connected — turn off {server.name}</span>
          </>
        ) : (
          `Turn on`
        )}
      </Button>
    </li>
  )
}

/**
 * The design's "Connect" link, rendered as what it actually is here: unavailable.
 *
 * Hermes *does* have the flow — `POST /api/mcp/servers/{name}/auth` starts a real
 * dashboard-hosted OAuth handshake and `GET /api/mcp/oauth/flows/{id}` polls it — so the
 * honest reason is not "the backend cannot", it is that this app hosts neither the popup
 * nor the callback the flow redirects to (`_mcp_oauth_callback_url` builds it from the
 * requesting origin, which here is Vite, not the dashboard). Wiring it means a popup, a
 * poll loop and a callback route; until then, saying so beats a button that opens a window
 * and strands it.
 */
const SignInAction: FC<{ name: string }> = ({ name }) => (
  <WithTooltip
    content="Signing in runs a browser OAuth flow that only the Hermes dashboard hosts"
    size="sm"
    showArrow={false}
    className="inline-flex shrink-0"
    tooltipContentProps={{ side: 'bottom', sideOffset: 6, className: 'max-w-60' }}
  >
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled
      aria-label={`Sign in to ${name} — only the Hermes dashboard hosts this flow`}
    >
      Sign in
    </Button>
  </WithTooltip>
)
