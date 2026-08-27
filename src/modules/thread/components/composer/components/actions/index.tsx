import type { FC } from 'react'
import { ArrowUpIcon } from '@repo/icons/arrow-up'
import { CheckIcon } from '@repo/icons/check'
import { LoaderIcon } from '@repo/icons/loader'
import { MicrophoneIcon } from '@repo/icons/microphone'
import { StopIcon } from '@repo/icons/stop'
import { XIcon } from '@repo/icons/x'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'

interface ActionsProps {
  /** True while the employee is mid-turn: the send button becomes stop. */
  working: boolean
  displayName: string
  canSend: boolean
  onStop: () => void
  isRecording: boolean
  isProcessing: boolean
  /** Dictation is unavailable while the socket is down. */
  canDictate: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onCancelRecording: () => void
  /** The draft is empty, so the microphone takes the send button's place. */
  isEmpty: boolean
}

/**
 * The tail of the dock — chatly-web's `PromptBoxActions`.
 *
 * The state machine is upstream's: a turn in flight shows stop; an empty draft
 * shows the microphone; anything typed replaces it with send; and while
 * dictating the whole dock is given over to cancel/confirm. Upstream animates
 * the send button in with `motion`; that dependency is not in this app, so the
 * swap is instant.
 */
export const Actions: FC<ActionsProps> = ({
  working,
  displayName,
  canSend,
  onStop,
  isRecording,
  isProcessing,
  canDictate,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  isEmpty,
}) => {
  if (isRecording || isProcessing) {
    return (
      <div className="flex shrink-0 items-center gap-3">
        <Button
          type="button"
          variant="icon-ghost"
          size="icon-sm"
          shape="pill"
          aria-label="Discard recording"
          disabled={isProcessing}
          onClick={onCancelRecording}
        >
          <XIcon />
        </Button>
        {isProcessing ? (
          <Button
            type="button"
            variant="icon-primary"
            size="icon-sm"
            shape="pill"
            aria-label="Transcribing"
            disabled
          >
            <LoaderIcon className="animate-spin" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="icon-primary"
            size="icon-sm"
            shape="pill"
            aria-label="Use recording"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onStopRecording()
            }}
          >
            <CheckIcon />
          </Button>
        )}
      </div>
    )
  }

  if (working) {
    return (
      <div className="flex shrink-0 items-center gap-3">
        <Button
          type="button"
          variant="icon-primary"
          size="icon-sm"
          shape="pill"
          aria-label={`Stop ${displayName}`}
          onClick={onStop}
        >
          <StopIcon />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center">
      {isEmpty ? (
        <Button
          type="button"
          variant="icon-primary"
          size="icon-sm"
          shape="pill"
          aria-label="Dictate a message"
          disabled={!canDictate}
          onClick={onStartRecording}
          className={cn('transition-none!')}
        >
          <MicrophoneIcon className="stroke-[1.5]!" />
        </Button>
      ) : (
        <Button
          type="submit"
          variant="icon-primary"
          size="icon-sm"
          shape="pill"
          aria-label="Send message"
          disabled={!canSend}
          onClick={(event) => event.stopPropagation()}
        >
          <ArrowUpIcon />
        </Button>
      )}
    </div>
  )
}
