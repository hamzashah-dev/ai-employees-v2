/**
 * The signed-in user, as far as this app can know.
 *
 * Hermes exposes no user-identity endpoint — `/api/status` reports the install, not a
 * person — so the sidebar footer, the top bar and the dashboard greeting all read these.
 * Promoted to core the moment a second surface needed them; one edit here when there is a
 * real identity source.
 */
export const ACCOUNT_NAME = 'Imagine User'
export const ACCOUNT_PLAN = 'Pro Plan'

/**
 * The profile name that means "the install itself".
 *
 * Every MCP route is profile-scoped: `GET /api/mcp/servers` takes `?profile=` and
 * `_profile_scope` re-roots config resolution to that employee's directory. There is
 * no account-level MCP surface — but that function documents `None` / `""` /
 * `"current"` as "the dashboard's own profile", which is the install's own
 * `config.yaml` rather than any one employee's. That install-level list *is* the
 * honest account-level answer, and `'current'` is the spelling that says so out loud
 * instead of relying on an empty string reading as a default.
 *
 * In core because two features now ask the same question: Settings › Connectors lists
 * them, and the sidebar's `Integrations` row counts them.
 *
 * Swap this the day Hermes grows a real account-level MCP surface.
 */
export const ACCOUNT_PROFILE = 'current'
