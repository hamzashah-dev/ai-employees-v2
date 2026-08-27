import type { HermesMcpServer } from '@/modules/core/services/hermes/types'

export interface ConnectorLine {
  /** Where the server actually is — a URL for http, the launch command for stdio. */
  detail: string
  /**
   * True when Hermes says the server authenticates by OAuth.
   *
   * This is the *requirement*, not the state. `_mcp_server_summary` in
   * `computer_cli/web_server.py` returns `auth` from the server's config and nothing else —
   * there is no field anywhere on `GET /api/mcp/servers` saying whether a token is on disk,
   * so the design's "Not signed in" cannot be answered honestly. The only route that knows
   * is `POST /api/mcp/servers/{name}/test`, which opens a live connection to find out; a
   * modal must not spawn an `npx` cold start per row to draw a subtitle.
   */
  needsOAuth: boolean
}

export function describeConnector(server: HermesMcpServer): ConnectorLine {
  const detail =
    server.transport === 'http'
      ? (server.url?.trim() ?? 'HTTP server')
      : (server.command?.trim() ?? server.transport)

  return { detail, needsOAuth: server.auth === 'oauth' }
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
