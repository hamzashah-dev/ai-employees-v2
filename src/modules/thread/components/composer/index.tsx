import type { FC } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { ArrowUpIcon } from '@repo/icons/arrow-up'
import { DropdownIcon } from '@repo/icons/dropdown-icon'
import { PlusIcon } from '@repo/icons/plus'
import { StopIcon } from '@repo/icons/stop'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { Spinner } from '@/modules/core/components/spinner'
import type { ConnectionState } from '@/modules/core/services/hermes/gateway'
import { useComposer } from './hooks/use-composer'

interface ComposerProps {
  profile: string
  displayName: string
  /** True while the employee is mid-turn: send becomes stop. */
  working: boolean
  connection: ConnectionState
  columnClassName: string
  /** Overrides the default "Message <name>" prompt — the chat home asks anything of anyone. */
  placeholder?: string
}

export const Composer: FC<ComposerProps> = ({
  profile,
  displayName,
  working,
  connection,
  columnClassName,
  placeholder,
}) => {
  const {
    value,
    setValue,
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

  return (
    <div className="flex shrink-0 justify-center p-6">
      <form onSubmit={onSubmit} className={cn('flex flex-col', columnClassName)}>
        <div className="flex min-h-[120px] flex-col justify-between rounded-3xl border border-primary bg-fill-elevated p-4">
          <TextareaAutosize
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            minRows={1}
            maxRows={10}
            disabled={offline}
            placeholder={placeholder ?? `Message ${displayName}`}
            aria-label={placeholder ?? `Message ${displayName}`}
            aria-describedby={note ? noteId : undefined}
            className="scrollbar-minimal w-full resize-none bg-transparent text-body-md text-primary outline-none placeholder:text-tertiary disabled:text-disabled disabled:placeholder:text-tertiary-disabled"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input ref={fileInput} type="file" className="hidden" onChange={onPickFile} />
              <Button
                type="button"
                variant="icon-outline"
                size="icon-sm"
                shape="pill"
                aria-label="Attach file"
                disabled={offline || attaching}
                onClick={() => fileInput.current?.click()}
                className="text-secondary [&>svg]:size-4"
              >
                {attaching ? <Spinner /> : <PlusIcon />}
              </Button>

              {/*
                Model and quality are read-outs, not pickers: the model is fixed
                by the Hermes profile and there is no quality knob behind it. The
                canvas draws both as plain divs, and a control that does nothing
                would be worse than one that plainly does not move.
              */}
              <span
                title="The model is set by this employee's profile"
                className="flex h-8 items-center gap-1.5 rounded-2xl border border-secondary px-3 text-label-md text-secondary"
              >
                Auto
                <DropdownIcon className="size-2" />
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span
                title="Quality follows the model set by this employee's profile"
                className="flex items-center gap-1.5 text-label-md text-secondary"
              >
                High quality
                <DropdownIcon className="size-2" />
              </span>

              {working ? (
                <Button
                  type="button"
                  variant="icon-primary"
                  size="icon-sm"
                  shape="pill"
                  aria-label={`Stop ${displayName}`}
                  onClick={onStop}
                  className="[&>svg]:size-4"
                >
                  <StopIcon />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="icon-primary"
                  size="icon-sm"
                  shape="pill"
                  aria-label="Send message"
                  disabled={!canSend}
                  className="[&>svg]:size-4"
                >
                  <ArrowUpIcon />
                </Button>
              )}
            </div>
          </div>
        </div>

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
