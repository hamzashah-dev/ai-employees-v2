import { useQuery } from '@tanstack/react-query'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { fetchProfiles } from '@/modules/core/services/hermes/rest'
import { toDisplayName } from '@/modules/core/utils/identity'

/** Hermes ships a profile literally named `default`; prefer it when it is there. */
const DEFAULT_PROFILE = 'default'

/**
 * Picks who an "Ask anything" message goes to.
 *
 * The canvas's D1 is the surrounding product's chat home, where the composer talks to the
 * general assistant. This app has no general-chat concept — every thread belongs to an
 * employee — so the message goes to the `default` profile, falling back to the first on the
 * roster. With nobody hired there is no honest target, so the composer is withheld entirely
 * rather than shown pointing at nothing.
 */
export const useChatHome = () => {
  const { data: profiles, isPending, isError } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })

  const names = profiles?.map((profile) => profile.name) ?? []
  const target = names.includes(DEFAULT_PROFILE) ? DEFAULT_PROFILE : names[0]

  const connection = useChatStore((state) => state.connection)
  const working = useChatStore((state) =>
    target ? state.threads[target]?.status === 'working' : false,
  )

  return {
    target,
    displayName: target ? toDisplayName(target) : '',
    connection,
    working,
    isPending,
    isError,
  }
}
