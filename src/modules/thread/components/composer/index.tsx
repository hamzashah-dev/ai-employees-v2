import { useId, useRef, useState } from 'react'
import type { ChangeEvent, FC, FormEvent, KeyboardEvent } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Button } from '@/modules/core/components/button'
import { AttachIcon, SendIcon, StopIcon } from '@/modules/core/components/icon'
import { Spinner } from '@/modules/core/components/status-pill'
import type { ConnectionState } from '@/modules/core/services/hermes/gateway'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { cn } from '@/modules/core/utils/cn'
import { useAttachFile } from '../../hooks/use-attach-file'

interface ComposerProps {
  profile: string
  displayName: string
  /** True while the employee is mid-turn: send becomes stop. */
  working: boolean
  connection: ConnectionState
  columnClassName: string
}

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

export const Composer: FC<ComposerProps> = ({
  profile,
  displayName,
  working,
  connection,
  columnClassName,
}) => {
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

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    submit()
  }

  const onPickFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
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

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    // `isComposing` guards IME candidate selection, where Enter commits the
    // candidate and must not send the message.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  return (
    <form onSubmit={onSubmit} className={cn('mx-auto w-full', columnClassName)}>
      <div className="flex min-h-[120px] flex-col justify-between rounded-[24px] border border-[rgb(var(--color-ink-2))] bg-[rgb(var(--color-ink-1))] p-3">
        <TextareaAutosize
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          minRows={1}
          maxRows={10}
          disabled={offline}
          placeholder={`Message ${displayName}`}
          aria-label={`Message ${displayName}`}
          aria-describedby={note ? noteId : undefined}
          className="scrollbar-subtle w-full resize-none bg-transparent px-1 text-body text-[rgb(var(--color-ink-7))] outline-none placeholder:text-[rgb(var(--color-ink-7)/0.5)] disabled:text-[rgb(var(--color-ink-5))] disabled:placeholder:text-[rgb(var(--color-ink-5))]"
        />

        <div className="mt-3 flex items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(event) => void onPickFile(event)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach file"
            disabled={offline || attaching}
            onClick={() => fileInput.current?.click()}
          >
            {attaching ? <Spinner /> : <AttachIcon />}
          </Button>

          <span
            className="rounded-full bg-[rgb(var(--color-ink-2))] px-3 py-1 text-label-sm text-[rgb(var(--color-ink-6))]"
            title="Model selection is handled by the profile"
          >
            Auto
          </span>

          {working ? (
            <Button
              type="button"
              variant="neutral"
              size="icon"
              aria-label={`Stop ${displayName}`}
              onClick={() => void useChatStore.getState().stop(profile)}
              className="ml-auto size-9 rounded-full"
            >
              <StopIcon />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="icon"
              aria-label="Send message"
              disabled={!canSend}
              className="ml-auto size-9 rounded-full"
            >
              <SendIcon />
            </Button>
          )}
        </div>
      </div>

      {attachError && (
        <p role="alert" className="mt-2 text-center text-label-sm text-[rgb(var(--color-danger))]">
          {attachError}{' '}
          <button type="button" onClick={clearError} className="underline">
            Dismiss
          </button>
        </p>
      )}

      {note && (
        <p
          id={noteId}
          role="status"
          className="mt-2 text-center text-label-sm text-[rgb(var(--color-ink-7)/0.5)]"
        >
          {note}
        </p>
      )}
    </form>
  )
}
