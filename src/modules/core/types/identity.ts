import type { MascotShape } from '../constants/identity'

/**
 * The per-device presentation state layered over a profile's derived identity.
 *
 * Every field is optional and every field is *local*. Hermes has no place to put any of
 * them: `ProfileInfo` (`computer_cli/profiles.py`) carries name, path, model, provider,
 * skill count and description and nothing visual, and `write_profile_meta` whitelists
 * `profile.yaml` to `description` + `description_auto` — a colour written there is
 * silently dropped on the next save. See `stores/identity-store.ts`.
 */
export interface IdentityOverride {
  /** Index into `IDENTITY_COLORS`, wrapped on read so a stale index cannot blank an avatar. */
  colorIndex?: number
  shape?: MascotShape
  /** What the user renamed this employee to. Empty/whitespace means "no override". */
  title?: string
}
