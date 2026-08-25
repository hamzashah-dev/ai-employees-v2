import { useCallback, useRef, useState } from 'react'
import { getHermes } from '@/modules/core/hooks/use-hermes'

/**
 * Attaching a file to the next message.
 *
 * `file.attach` does not send anything on its own — it stages the file against
 * the session and hands back a `@file:<ref>` token. The token has to be present
 * in the text of a later `prompt.submit` for the agent to see the file, so this
 * returns it for the composer to append to the draft.
 */

/** Hermes caps attachments at 25MB; refuse locally rather than round-trip it. */
const MAX_BYTES = 25 * 1024 * 1024

export interface UseAttachFileResult {
  attach: (file: File) => Promise<string | null>
  pending: boolean
  error?: string
  clearError: () => void
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

export function useAttachFile(profile: string): UseAttachFileResult {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  // Guards against a second pick landing while the first is still uploading.
  const inFlight = useRef(false)

  const clearError = useCallback(() => setError(undefined), [])

  const attach = useCallback(
    async (file: File): Promise<string | null> => {
      if (inFlight.current) return null

      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than the 25MB attachment limit.`)
        return null
      }

      inFlight.current = true
      setPending(true)
      setError(undefined)

      try {
        const dataUrl = await readAsDataUrl(file)
        const result = await getHermes().sessions.attachFile(profile, dataUrl, file.name)
        const ref = result.ref_text?.trim()
        if (!ref) {
          setError(`${file.name} was not attached — Hermes returned no reference.`)
          return null
        }
        return ref
      } catch (err) {
        setError((err as Error).message)
        return null
      } finally {
        inFlight.current = false
        setPending(false)
      }
    },
    [profile],
  )

  return { attach, pending, error, clearError }
}
