import type { HermesMcpServer } from '@/modules/core/services/hermes/types'

export interface ConnectorLine {
  /** "HTTP · 14 tools" — how it connects, and how much it brings. */
  detail: string
  /**
   * True when Hermes says the server authenticates by OAuth *and* it is currently off.
   *
   * This is the *requirement*, not the state. `_mcp_server_summary` in
   * `computer_cli/web_server.py` returns `auth` from the server's config and nothing else —
   * there is no field anywhere on `GET /api/mcp/servers` saying whether a token is on disk,
   * so the design's "Not signed in" cannot be answered honestly. The only route that knows
   * is `POST /api/mcp/servers/{name}/test`, which opens a live connection to find out; a
   * modal must not spawn an `npx` cold start per row to draw a subtitle.
   *
   * Suppressed once the server is on, because at that point the line is nagging about
   * something the user has already dealt with — and we cannot tell whether they have.
   */
  needsOAuth: boolean
}

/** "HTTP", "stdio" — the transport as the card labels it. */
function transportLabel(server: HermesMcpServer): string {
  if (server.transport === 'http') return 'HTTP'
  if (server.transport === 'stdio') return 'stdio'
  return 'unknown transport'
}

/**
 * The line under a connector's name.
 *
 * Transport plus tool count, rather than the URL or the launch command it used to show. Both
 * of those are long enough to be truncated in a 720px card — an https URL loses its path and
 * a `uvx` line loses its package — so the row spent its subtitle on a string nobody could
 * read to the end. `tools` is on the payload already (`_mcp_server_summary` returns it), and
 * "22 tools" is the thing you actually want to know about a server you are deciding whether
 * to leave on.
 *
 * `tools` is optional and nullable: a server Hermes has never successfully started reports
 * none, and that is rendered as the transport alone rather than as "0 tools", which would
 * read as a broken server rather than an unqueried one.
 */
export function describeConnector(server: HermesMcpServer): ConnectorLine {
  const count = server.tools?.length ?? 0
  const detail =
    count > 0
      ? `${transportLabel(server)} · ${count} ${count === 1 ? 'tool' : 'tools'}`
      : transportLabel(server)

  return { detail, needsOAuth: server.auth === 'oauth' && !server.enabled }
}

/**
 * "3 of 5 on", or "None on" — the section's count line.
 *
 * `enabled` is the real flag `PUT /api/mcp/servers/{name}/enabled` writes, so this counts
 * something true. It is not a count of *connected* servers: Hermes reads the flag when a
 * session starts and never reports a live connection state back.
 */
export function summariseConnectors(servers: HermesMcpServer[]): string {
  const on = servers.filter((server) => server.enabled).length
  if (servers.length === 0) return ''
  if (on === 0) return `None of ${servers.length} on`
  return `${on} of ${servers.length} on`
}

/** The two names the Info tile names, so the glance says *which* are on, not just how many. */
export function namesOfEnabled(servers: HermesMcpServer[], limit = 2): string {
  const on = servers.filter((server) => server.enabled).map((server) => server.name)
  if (on.length === 0) return 'None on'
  if (on.length <= limit) return on.join(', ')
  return `${on.slice(0, limit).join(', ')} +${on.length - limit}`
}
