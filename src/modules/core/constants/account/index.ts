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
