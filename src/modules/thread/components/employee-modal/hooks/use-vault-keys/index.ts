import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileEnvKey, useProfileEnv } from '@/modules/core/hooks/use-profile-env'
import {
  deleteProfileEnvVar,
  revealProfileEnvVar,
  setProfileEnvVar,
} from '@/modules/core/services/hermes/rest'
import { toVaultKeys, type VaultKeyRow } from '../../utils/vault-keys'

export interface UseVaultKeysResult {
  keys: VaultKeyRow[]
  isLoading: boolean
  error: Error | null
  /** Real values, keyed by name, for the rows revealed in this modal session. */
  revealed: Readonly<Record<string, string>>
  reveal: (name: string) => void
  hide: (name: string) => void
  save: (name: string, value: string) => void
  remove: (name: string) => void
  /** The row a write is in flight for, so only that row shows a spinner. */
  pendingName?: string
  /** Hermes' own refusal — a denied name, a 429 on reveal — shown verbatim. */
  writeError?: string
  clearWriteError: () => void
}

/**
 * The employee's credentials, and the three writes that change them.
 *
 * Every mutation invalidates `['profile-env', profile]`, which is the same entry the
 * marketplace's hire receipt counts required keys against — so answering a key here ticks
 * the receipt off there without either surface knowing about the other.
 *
 * **Revealed values are deliberately component state, not cache.** They are the one thing in
 * this app that is a secret in plaintext; keeping them in React Query would persist them for
 * the life of the tab and hand them to every other subscriber of the key. Here they die with
 * the modal, and a re-reveal costs another audited call.
 */
export function useVaultKeys(profile: string): UseVaultKeysResult {
  const queryClient = useQueryClient()
  const env = useProfileEnv(profile)
  const [revealed, setRevealed] = useState<Record<string, string>>({})

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: profileEnvKey(profile) })

  const revealer = useMutation({
    mutationFn: (name: string) => revealProfileEnvVar(profile, name),
    onSuccess: (value, name) => setRevealed((seen) => ({ ...seen, [name]: value })),
  })

  const writer = useMutation({
    mutationFn: ({ name, value }: { name: string; value: string }) =>
      setProfileEnvVar(profile, name, value),
    onSuccess: (_result, { name }) => {
      /*
       * A rewritten key's old plaintext is still on screen otherwise, labelled as the
       * current value. Drop it rather than showing a stale secret as a live one.
       */
      setRevealed(({ [name]: _gone, ...rest }) => rest)
      return invalidate()
    },
  })

  const remover = useMutation({
    mutationFn: (name: string) => deleteProfileEnvVar(profile, name),
    onSuccess: (_result, name) => {
      setRevealed(({ [name]: _gone, ...rest }) => rest)
      return invalidate()
    },
  })

  const inFlight = [revealer, writer, remover].find((m) => m.isPending)
  const failed = [revealer, writer, remover].find((m) => m.error)

  return {
    keys: toVaultKeys(env.data),
    isLoading: env.isPending,
    error: env.error,
    revealed,
    reveal: (name) => revealer.mutate(name),
    hide: (name) => setRevealed(({ [name]: _gone, ...rest }) => rest),
    save: (name, value) => writer.mutate({ name, value }),
    remove: (name) => remover.mutate(name),
    pendingName: nameOf(inFlight?.variables),
    writeError: failed?.error?.message || undefined,
    clearWriteError: () => {
      revealer.reset()
      writer.reset()
      remover.reset()
    },
  }
}

/** The three mutations take either a bare name or `{name, value}`. */
function nameOf(variables: unknown): string | undefined {
  if (typeof variables === 'string') return variables
  if (variables && typeof variables === 'object' && 'name' in variables) {
    return String((variables as { name: unknown }).name)
  }
  return undefined
}
