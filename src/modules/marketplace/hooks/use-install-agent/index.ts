import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { createProfile, updateProfileSoul } from '@/modules/core/services/hermes/rest'
import { composeSoul } from '../../utils/compose-soul'
import type { CatalogAgent } from '../../constants/catalog'

/**
 * What a hired agent runs on.
 *
 * `POST /api/profiles` only writes a model into the new profile's config.yaml
 * when BOTH `provider` and `model` are sent (web_server.py ~14885). Send
 * neither and the profile gets no model config at all, and a profile's config
 * is a one-time COPY of the root config, not live inheritance — so a hire
 * silently lands on whatever model the root happened to hold at hire time, and
 * stays there. That is how a hire ends up on an expensive model nobody chose.
 * Pin it explicitly instead.
 */
export const HIRED_AGENT_MODEL = { provider: 'openrouter', model: 'minimax/minimax-m3' } as const

/**
 * Hiring an agent is creating a Hermes profile named after it, seeded with the
 * catalog tagline as its description — and then giving it an identity.
 *
 * That second step matters more than it looks. `POST /api/profiles` copies the
 * bundled skills and writes the description, but leaves `SOUL.md` as the stock
 * Computer Agent boilerplate. A freshly hired "LinkedIn Agent" therefore has
 * every LinkedIn skill on disk and still answers "I'm Computer Agent — I can
 * write code, handle email…", because the system prompt never mentioned
 * LinkedIn. The card and the thread disagree about who was hired.
 *
 * EVERY agent gets an identity, not just the two with a hand-authored `soul`:
 * `composeSoul` falls back to the card's own copy, quoted rather than
 * paraphrased. Writing souls by hand does not scale to ninety-seven entries,
 * and leaving ninety-five of them as "I'm Computer Agent" is the bug this
 * whole path exists to fix.
 *
 * The soul write is deliberately NOT fatal. The profile exists by then and is
 * usable; failing the whole mutation would leave a hired agent behind an error
 * state and tempt a retry that 409s on the name. It is surfaced instead as a
 * warning, so the failure is visible without being destructive.
 *
 * Errors from the create are left on the mutation rather than swallowed —
 * Hermes answers a name collision or a bad slug with a `detail` string worth
 * reading, and the card prints it.
 */
export function useInstallAgent(
  agent: CatalogAgent,
): UseMutationResult<unknown, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['install-agent', agent.id],
    mutationFn: async () => {
      const created = await createProfile({
        // Clone the default profile's config rather than starting bare.
        //
        // A profile created with no config.yaml gets `managed_persistence:
        // false`, which means "each session gets a random userId (ephemeral)"
        // (tools/browser_camofox.py). For a browsing agent that is fatal in a
        // quiet way: a human signs into LinkedIn in the live view, and the next
        // run opens a fresh browser context that has never heard of them — and
        // the click may not even land in the context the agent is driving.
        // The default profile already carries the identity block
        // (`user_id` / `session_key` / `adopt_existing_tab: true`), so cloning
        // is what makes "log in once" actually mean once.
        //
        // Safe to combine with the model pin below: the endpoint writes the
        // explicit model AFTER create_profile() returns, so it overrides
        // whatever the clone brought. Same for SOUL.md, overwritten right after.
        clone_from_default: true,
        name: agent.id,
        description: agent.tagline,
        ...HIRED_AGENT_MODEL,
      })
      try {
        await updateProfileSoul(agent.id, composeSoul(agent))
      } catch (error) {
        console.warn(
          `[marketplace] ${agent.name} was hired but kept the default SOUL.md — ` +
            `it will answer as a general assistant.`,
          error,
        )
      }
      return created
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  })
}
