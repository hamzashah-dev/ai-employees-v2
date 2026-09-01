import type { FC } from 'react'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { SearchIcon } from '@repo/icons/search'
import { Button } from '@repo/ui/button'
import { Skeleton } from '@repo/ui/skeleton'
import { Spinner } from '@/modules/core/components/spinner'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'
import { useAccountConnectors } from './hooks/use-account-connectors'

/**
 * Screen 2b — Connectors, at account level.
 *
 * The integrations design, one level up from an employee: the same MCP servers the
 * composer's dropdown lists, but the install's own set rather than one profile's. See
 * `ACCOUNT_PROFILE` in `modules/core/constants/account` for why that is the honest
 * reading of "account level" — Hermes has no account-level MCP surface, and every
 * MCP route is profile-scoped.
 *
 * Three things the design asks for that `GET /api/mcp/servers` cannot answer, and
 * what is drawn instead:
 *
 * 1. **A description per connector.** `_mcp_server_summary` (`computer_cli/
 *    web_server.py`) returns name, transport, url, command, args, env, auth, enabled
 *    and tools. There is no description, blurb or vendor id, so the line under a
 *    name is how the server connects and how much it brings — see
 *    {@link describeServer}. A sentence invented per server is the one thing this
 *    surface must not print.
 * 2. **A brand mark per row.** Same payload, same gap: no icon and no vendor id. A
 *    name→logo lookup does exist, in `modules/thread/components/connectors-dialog/utils/
 *    connector-icon`, and it belongs in `modules/core` — until it moves, every row here
 *    draws the generic connector glyph rather than this file forking a forty-entry table.
 * 3. **Live connection state.** `enabled` is a config flag Hermes reads when a turn
 *    starts; nothing reports whether a server is reachable or signed in. Only
 *    `POST /api/mcp/servers/{name}/test` knows, and it finds out by opening a
 *    connection, which a list must not do once per row. So "connected" here means
 *    "switched on", and the footnote says so rather than implying a live socket.
 */
export const ConnectorsView: FC = () => {
  const {
    query,
    setQuery,
    servers,
    results,
    connectedCount,
    isLoading,
    error,
    toggle,
    pendingName,
  } = useAccountConnectors()

  const hasServers = !isLoading && !error && servers.length > 0

  return (
    <section aria-label="Connectors" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-heading-xs font-medium text-primary">Connectors</h2>
          <p className="text-label-md text-secondary">
            The outside systems this account can reach — the MCP servers on this Hermes
            install. Every employee you hire inherits them unless its own config says
            otherwise.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasServers && (
            <p className="whitespace-nowrap text-label-sm text-tertiary">
              {connectedCount} connected
            </p>
          )}
          <SearchField value={query} onChange={setQuery} />
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full bg-fill-elevated" />
          <Skeleton className="h-14 w-full bg-fill-elevated" />
        </div>
      )}

      {error && (
        <p role="alert" className="text-label-md text-critical">
          {error.message}
        </p>
      )}

      {!isLoading && !error && servers.length === 0 && (
        <p className="text-label-md text-tertiary">
          No MCP servers are configured on this install. Adding one is a Hermes dashboard
          job — this app has no surface for it.
        </p>
      )}

      {hasServers && results.length === 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-label-md text-tertiary">
            No connector matches “{query.trim()}”.
          </p>
          <Button type="button" variant="link-secondary" size="xs" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((server) => (
            <ConnectorRow
              key={server.name}
              server={server}
              isPending={pendingName === server.name}
              onToggle={() => toggle(server)}
            />
          ))}
        </ul>
      )}

      {hasServers && (
        <p className="text-label-xs text-tertiary">
          Connected means Hermes loads the server when a turn starts, so a change here
          applies to the next message. Whether the server then answers is not something
          Hermes reports back.
        </p>
      )}
    </section>
  )
}

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Hand-rolled, because `@repo/ui` ships no text input — `src/repo-ui` contains no
 * `<input>` anywhere. The class list is the marketplace search pill's, so the two
 * search boxes in this app are one control rather than two lookalikes.
 *
 * The visible placeholder is the terse `Search`; the accessible name is the fuller
 * "Search connectors", because a screen-reader user hearing "Search" on a page whose
 * sidebar also has one cannot tell which they are in.
 */
const SearchField: FC<SearchFieldProps> = ({ value, onChange }) => (
  <label className="flex h-8 w-[168px] items-center gap-2 rounded-full bg-fill px-3 focus-within:ring-2 focus-within:ring-brand tablet:w-[200px]">
    <span className="sr-only">Search connectors</span>
    <SearchIcon className="size-4 shrink-0 text-tertiary" />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search"
      autoComplete="off"
      spellCheck={false}
      className="min-w-0 flex-1 bg-transparent text-label-md text-primary outline-none placeholder:text-tertiary"
    />
  </label>
)

interface ConnectorRowProps {
  server: HermesMcpServer
  isPending: boolean
  onToggle: () => void
}

/**
 * One connector.
 *
 * The control is a button whose label states what pressing it does — Connect or
 * Disconnect — rather than a switch, because the write is not instant in the sense a
 * switch implies: `PUT …/{name}/enabled` edits `config.yaml`, and Hermes reads that
 * file when the next turn starts. The accessible name carries the server's name too,
 * so a screen-reader user hears which of a dozen identical buttons they are on.
 */
const ConnectorRow: FC<ConnectorRowProps> = ({ server, isPending, onToggle }) => (
  <li className="flex items-center gap-3 rounded-2xl border border-primary bg-fill-elevated px-4 py-3">
    <ConnectorsIcon className="size-5 shrink-0 stroke-[1.125] text-secondary" />

    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-label-md text-primary">{server.name}</span>
      <span className="truncate text-label-xs text-tertiary">
        {describeServer(server)}
      </span>
    </span>

    <Button
      type="button"
      variant={server.enabled ? 'outline' : 'secondary'}
      size="sm"
      disabled={isPending}
      onClick={onToggle}
      aria-label={
        server.enabled ? `Disconnect ${server.name}` : `Connect ${server.name}`
      }
    >
      {isPending && <Spinner />}
      {server.enabled ? 'Disconnect' : 'Connect'}
    </Button>
  </li>
)

/** "HTTP", "stdio" — the transport as the row labels it. */
function transportLabel(server: HermesMcpServer): string {
  if (server.transport === 'http') return 'HTTP'
  if (server.transport === 'stdio') return 'stdio'
  return 'unknown transport'
}

/**
 * The line under a connector's name, in place of the description Hermes has none of.
 *
 * How it connects, where to, and how many tools it brings — every part read off the
 * payload. `tools` is optional and nullable: a server Hermes has never successfully
 * started reports none, which is drawn as no tool count rather than "0 tools", since
 * that reads as a broken server rather than an unqueried one.
 */
function describeServer(server: HermesMcpServer): string {
  const parts = [transportLabel(server)]

  if (server.transport === 'http' && server.url) parts.push(hostOf(server.url))
  if (server.transport === 'stdio' && server.command) parts.push(server.command)

  const count = server.tools?.length ?? 0
  if (count > 0) parts.push(`${count} ${count === 1 ? 'tool' : 'tools'}`)

  return parts.join(' · ')
}

/** The host alone, so a long URL does not spend the whole line on a path. */
function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
