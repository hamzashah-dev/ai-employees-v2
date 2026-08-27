import { useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent, RefObject } from 'react'
import type { ConnectionState } from '@/modules/core/services/hermes/gateway'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { useAttachFile } from '../../../../hooks/use-attach-file'

/** Why the composer is shut, in the reader's terms rather than the socket's. */
function connectionNote(connection: ConnectionState): string | null {
  switch (connection) {
    case 'open':
      return null
    case 'idle':
    case 'connecting':
      return 'Connecting to Hermes — the composer opens as soon as the connection is live.'
    case 'reconnecting':
      return 'Reconnecting to Hermes. Your message can go out once it is back.'
    case 'closed':
      return 'Disconnected from Hermes. Nothing can be sent until the connection returns.'
  }
}

export interface UseComposerResult {
  value: string
  setValue: (value: string) => void
  /** The connection is not open, so nothing can be sent. */
  offline: boolean
  /** Set while `offline`, explaining which state the socket is in. */
  note: string | null
  noteId: string
  canSend: boolean
  /** Appends to the draft rather than replacing it — used by dictation. */
  insertText: (text: string) => void
  fileInput: RefObject<HTMLInputElement | null>
  attaching: boolean
  attachError?: string
  clearAttachError: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onPickFile: (event: ChangeEvent<HTMLInputElement>) => void
  onStop: () => void
}

export function useComposer(profile: string, connection: ConnectionState): UseComposerResult {
  const [value, setValue] = useState('')
  const [draftFor, setDraftFor] = useState(profile)
  const noteId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const { attach, pending: attaching, error: attachError, clearError } = useAttachFile(profile)

  // A draft belongs to the employee it was written for; carrying it across a
  // switch would put words in the wrong thread. Adjusting during render is
  // React's own answer to state a prop change invalidates — an effect would
  // paint the stale draft first.
  if (draftFor !== profile) {
    setDraftFor(profile)
    setValue('')
  }

  const offline = connection !== 'open'
  const note = connectionNote(connection)
  const canSend = value.trim().length > 0 && !offline

  const submit = (): void => {
    const text = value.trim()
    if (!text || offline) return
    setValue('')
    void useChatStore.getState().send(profile, text)
  }

  const pickFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    // Reset immediately so picking the same file twice still fires a change.
    event.target.value = ''
    if (!file) return

    const ref = await attach(file)
    if (!ref) return

    // The agent only sees the file if its reference is in the message text, so
    // the token goes into the draft rather than into hidden state.
    setValue((current) => (current.trim() ? `${current.trimEnd()} ${ref} ` : `${ref} `))
  }

  const insertText = (text: string): void => {
    const addition = text.trim()
    if (!addition) return
    setValue((current) => (current.trim() ? `${current.trimEnd()} ${addition}` : addition))
  }

  return {
    value,
    setValue,
    insertText,
    offline,
    note,
    noteId,
    canSend,
    fileInput,
    attaching,
    attachError,
    clearAttachError: clearError,
    onSubmit: (event) => {
      event.preventDefault()
      submit()
    },
    onKeyDown: (event) => {
      // `isComposing` guards IME candidate selection, where Enter commits the
      // candidate and must not send the message.
      if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
      event.preventDefault()
      submit()
    },
    onPickFile: (event) => void pickFile(event),
    onStop: () => void useChatStore.getState().stop(profile),
  }
}
