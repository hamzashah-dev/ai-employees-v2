import { useCallback, useState } from 'react'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { SecretRequest } from '@/modules/core/types/chat'
import { secretLabel } from '../../utils/secret-label'

export interface SecretRequestState {
  /** The standing request, or undefined when the agent is not asking for one. */
  request: SecretRequest | undefined
  /** Field label for `request`, `''` when there is nothing to label. */
  label: string
  /**
   * Hand the value to `secret.respond`. It is a parameter and nothing else — see
   * the note on the hook.
   */
  submit: (value: string) => Promise<void>
  /** Answer "Not now": the tool comes back `skipped` and the turn carries on. */
  skip: () => Promise<void>
  /** True while either answer is in flight, so the card can disable both. */
  isSubmitting: boolean
}

/**
 * View model for the one card that can un-park a `secret.request`.
 *
 * The agent thread is blocked inside `_block("secret.request", …)` with **no
 * timeout at all**, so until this resolves nothing else moves in the session:
 * there is no deadline to draw and no way through other than answering or
 * skipping.
 *
 * **The value is never state.** It stays in the card's own input, is passed
 * through `submit` into the `secret.respond` params, and is never put in the
 * store, a ref, a log line or an error message. Hermes writes it to the
 * profile's env file itself and keeps it out of the tool result, so this app can
 * hold nothing worth leaking — a property only preserved by not adding a place
 * to hold it.
 */
export function useSecretRequest(profile: string): SecretRequestState {
  const request = useChatStore((state) => state.threads[profile]?.secret)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(
    async (value: string) => {
      setIsSubmitting(true)
      try {
        await useChatStore.getState().submitSecret(profile, value)
      } finally {
        // The card unmounts on success — the store clears the request — so this
        // only ever matters on the failure path, where the card stays standing
        // and has to be usable again.
        setIsSubmitting(false)
      }
    },
    [profile],
  )

  const skip = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await useChatStore.getState().skipSecret(profile)
    } finally {
      setIsSubmitting(false)
    }
  }, [profile])

  return {
    request,
    label: request ? secretLabel(request.envVar, request.prompt) : '',
    submit,
    skip,
    isSubmitting,
  }
}
