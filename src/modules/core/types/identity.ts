import type { MascotShape } from '../constants/identity'
import type { AvatarPropId } from '../constants/avatar-props'

/**
 * The per-device presentation state layered over a profile's derived identity.
 *
 * Every field is optional and every field is *local*. Hermes has no place to put any of them:
 * `ProfileInfo` (`computer_cli/profiles.py`) carries name, path, model, provider, skill count
 * and description and nothing visual, and `write_profile_meta` whitelists `profile.yaml` to
 * `description` + `description_auto` — a colour written there is silently dropped on the next
 * save. See `stores/identity-store.ts`.
 */
export interface IdentityOverride {
  /** Index into the prop-compatible palette, wrapped on read so a stale index cannot blank an avatar. */
  colorIndex?: number
  shape?: MascotShape
  /**
   * The job glyph the user picked.
   *
   * Three states, not two. `undefined` means "no opinion, use what the catalogue says";
   * `null` means the user explicitly cleared it and wants a bare mark. Collapsing those
   * would make clearing a prop impossible — the derivation would immediately put it back.
   */
  prop?: AvatarPropId | null
  /** What the user renamed this employee to. Empty/whitespace means "no override". */
  title?: string
}
