import type { FC, ReactNode } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { cn } from '@repo/ui/cn'
import type { ConnectionState } from '@/modules/core/services/hermes/gateway'
import { Actions } from './components/actions'
import { AudioWaveform } from './components/audio-waveform'
import { ConnectorsDropdown } from './components/connectors-dropdown'
import { MoreDropdown } from './components/more-dropdown'
import {
  DOCK_CLASS,
  DOCK_END_CLASS,
  DOCK_START_CLASS,
  EDITOR_CLASS,
  EDITOR_WRAPPER_CLASS,
  PROMPT_BOX_CLASS,
} from './constants'
import { useComposer } from './hooks/use-composer'
import { useSpeechToText } from './hooks/use-speech-to-text'

interface ComposerProps {
  profile: string
  displayName: string
  /** True while the employee is mid-turn: send becomes stop. */
  working: boolean
  connection: ConnectionState
  columnClassName: string
  /** Overrides the default "Message <name>" prompt — the chat home asks anything of anyone. */
  placeholder?: string
  /**
   * A panel docked to the TOP of the prompt box, sharing its container.
   *
   * Used by the secret card. It belongs here rather than at the end of the
   * transcript because it is a control the user must act on, not a message: the
   * transcript scrolls and can carry it off-screen, while the prompt box is the
   * one thing that never moves. Docking also makes the ask read as part of the
   * input rather than as another bubble to scroll past.
   */
  above?: ReactNode
}

/**
 * The prompt box, a port of chatly-web's
 * `modules/core/components/prompt-box`.
 *
 * The chrome is upstream's to the class: the same container, the same dock, the
 * same `+` menu, the same microphone-becomes-send tail. Three things upstream
 * carries are deliberately absent — the plan ("Pro") dropdown, the model pill
 * and the chat/image/video mode pill. The first is not a concept Hermes has;
 * the other two would each be a picker over a choice this app cannot make: the
 * model is fixed by the employee's profile, and there is one mode.
 *
 * The editor is a textarea rather than upstream's TipTap. Nothing in this app
 * needs rich text, slash commands or command nodes, and the six-package
 * dependency they cost buys nothing here — so the *look* is ported and the
 * mechanism is not.
 */
export const Composer: FC<ComposerProps> = ({
  profile,
  displayName,
  working,
  connection,
  columnClassName,
  placeholder,
  above,
}) => {
  const {
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
    clearAttachError,
    onSubmit,
    onKeyDown,
    onPickFile,
    onStop,
  } = useComposer(profile, connection)

  const recorder = useSpeechToText({ onTranscript: insertText })
  const transcribing = recorder.isRecording || recorder.isProcessing

  const label = placeholder ?? `Message ${displayName}`

  return (
    <div className="flex shrink-0 justify-center p-6">
      <form onSubmit={onSubmit} className={cn('flex flex-col', columnClassName)}>
        {above}
        {/* With a panel docked above, the box drops its top rounding and its top
            border so the seam between the two is a single hairline rather than
            two stacked edges with a sliver of page between them. */}
        <div
          className={cn(PROMPT_BOX_CLASS, {
            'rounded-t-none border-t-0': Boolean(above),
          })}
          data-prompt-box
        >
          {recorder.isRecording ? (
            <AudioWaveform time={recorder.time} levels={recorder.levels} />
          ) : (
            <div className={EDITOR_WRAPPER_CLASS}>
              <TextareaAutosize
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={onKeyDown}
                minRows={1}
                maxRows={10}
                disabled={offline || recorder.isProcessing}
                placeholder={label}
                aria-label={label}
                aria-describedby={note ? noteId : undefined}
                className={EDITOR_CLASS}
              />
            </div>
          )}

          <div className={DOCK_CLASS}>
            {/* Upstream hides the head of the dock while dictating, so the
                waveform and the cancel/confirm pair get the full width. */}
            {!transcribing && (
              <div className={DOCK_START_CLASS}>
                <input ref={fileInput} type="file" className="hidden" onChange={onPickFile} />
                <MoreDropdown
                  openFilePicker={() => fileInput.current?.click()}
                  disabled={offline}
                  attaching={attaching}
                />
                <ConnectorsDropdown profile={profile} />
              </div>
            )}

            <div className={DOCK_END_CLASS}>
              <Actions
                working={working}
                displayName={displayName}
                canSend={canSend}
                onStop={onStop}
                isRecording={recorder.isRecording}
                isProcessing={recorder.isProcessing}
                canDictate={!offline}
                onStartRecording={recorder.start}
                onStopRecording={recorder.stop}
                onCancelRecording={recorder.cancel}
                isEmpty={value.trim().length === 0}
              />
            </div>
          </div>
        </div>

        {recorder.error && (
          <p role="alert" className="mt-2 text-center text-label-sm text-critical">
            {recorder.error}{' '}
            <button type="button" onClick={recorder.clearError} className="cursor-pointer underline">
              Dismiss
            </button>
          </p>
        )}

        {attachError && (
          <p role="alert" className="mt-2 text-center text-label-sm text-critical">
            {attachError}{' '}
            <button type="button" onClick={clearAttachError} className="cursor-pointer underline">
              Dismiss
            </button>
          </p>
        )}

        {note && (
          <p id={noteId} role="status" className="mt-2 text-center text-label-sm text-tertiary">
            {note}
          </p>
        )}
      </form>
    </div>
  )
}
