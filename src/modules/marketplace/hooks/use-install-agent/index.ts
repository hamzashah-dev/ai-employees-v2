import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { installProfile } from '@/modules/core/services/hermes/rest'
import type { CatalogAgent } from '../../constants/catalog'

/**
 * Where the backend finds an agent's distribution pack.
 *
 * A path, not a URL, resolved by `profile_distribution._stage_source` relative
 * to the backend's working directory — which is the cloud-computer checkout,
 * since that is what serves `/api/*`. Every id in `AVAILABLE_AGENT_IDS` has a
 * directory there; that is what the gate means, and the invariant test in
 * `constants/catalog/catalog.test.ts` is what keeps it true.
 */
const packSource = (id: string): string => `agents/${id}`

/**
 * Hiring an agent installs its distribution pack.
 *
 * One call. `POST /api/profiles/install` runs `install_distribution`, which
 * copies the pack's `SOUL.md`, `config.yaml`, `profile.yaml`, `skills/`,
 * `cron/`, `hooks/` and `checks/` into `.computer/profiles/<id>`, then seeds the
 * bundled skills. Identity, model, tool gating and schedule all come from files
 * in `agents/<id>/` that are reviewable in a diff.
 *
 * ## Why this replaced create-then-write-soul
 *
 * The previous path called `POST /api/profiles` and then `PUT .../soul` with a
 * soul composed from the card's own marketing copy. It worked, and it made the
 * catalog a second source of truth for who an agent *is*: hiring "LinkedIn
 * Agent" produced an approximation of the card rather than the SOUL.md we
 * actually wrote and test against. `composeSoul` stays in the tree because it is
 * still the honest fallback for the ninety-three entries with no pack — but none
 * of those can be hired, since the shelf only renders gated ids.
 *
 * ## What the pack now has to carry itself
 *
 * The old path passed `clone_from_default: true`, and that was load-bearing for
 * a reason worth restating: without a `browser.camofox` block a profile gets
 * `managed_persistence: false`, meaning a random userId per session
 * (`tools/browser_camofox.py`). A human signs into LinkedIn once in the live
 * view and the next run opens a context that has never heard of them. Install
 * does not clone, so each pack's own `config.yaml` carries that block. All three
 * do; a fourth that forgets will look fine and quietly lose its logins.
 *
 * Same story for the model. The old path pinned one explicitly because a profile
 * config is a one-time COPY of the root config, so an unset model silently
 * freezes at whatever the root held on hire day. The pack pins it instead — the
 * agent declares what it runs on.
 *
 * ## Errors
 *
 * A missing or malformed pack, a version mismatch, or a name collision comes
 * back as a 400 with a readable `detail`, which the card prints. `force` is
 * deliberately not passed: hiring twice should say the profile already exists
 * rather than overwrite one the user has been using.
 */
export function useInstallAgent(
  agent: CatalogAgent,
): UseMutationResult<unknown, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['install-agent', agent.id],
    mutationFn: () => installProfile({ source: packSource(agent.id) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  })
}
