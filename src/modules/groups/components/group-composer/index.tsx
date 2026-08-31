import { useRef } from 'react'
import type { FC, KeyboardEvent } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { ArrowUpIcon } from '@repo/icons/arrow-up'
import { Button, buttonVariants } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'

/*
 * The prompt box's chrome, byte-for-byte the thread composer's.
 *
 * It is copied rather than imported because the boundary rule allows a feature
 * module to reach into `core` and `@repo/*` only, and these strings live in
 * `modules/thread`. If a third surface ever needs them they belong in `core`,
 * not in a cross-module import.
 */
const PROMPT_BOX_CLASS =
  'group flex w-full flex-col gap-3 rounded-3xl border border-primary bg-fill-variant px-3 pt-3 pb-3 transition duration-500 focus:border-primary focus-visible:border-primary active:border-primary'
const DOCK_CLASS = 'flex w-full items-center justify-between gap-2'
const DOCK_START_CLASS = 'flex shrink-0 items-center gap-2'
const DOCK_END_CLASS = 'flex w-full items-center justify-end gap-2'
const EDITOR_WRAPPER_CLASS = 'flex min-h-12 w-full items-center justify-center tablet:min-h-8'
const EDITOR_CLASS =
  'scrollbar-minimal max-h-72 w-full cursor-text resize-none overflow-auto border-none bg-inherit px-2 py-1 text-markdown-body font-normal text-primary opacity-100 outline-hidden ring-0 transition-[max-height] duration-700 ease-in-out placeholder:text-tertiary disabled:text-disabled disabled:placeholder:text-tertiary-disabled'

/**
 * Appended at the end rather than inserted at the caret: the caret lives in the
 * DOM node, not in the `value` this component is handed, and reaching for it
 * would put mutable state inside a component whose whole contract is props in,
 * callbacks out. A mention anywhere in the message addresses the same member,
 * so the position costs nothing.
 */
const withMention = (value: string, member: string): string => {
  const head = value.replace(/\s+$/, '')
  return head.length === 0 ? `@${member} ` : `${head} @${member} `
}

interface GroupComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  /** A round is in flight, or the socket is down. */
  disabled: boolean
  placeholder?: string
  /** Profile names the `@` menu offers, in seating order. */
  members: string[]
}

/**
 * The room's prompt box.
 *
 * Same shape as the one-to-one composer minus everything that has no meaning in
 * a room — no dictation, no attachment, no per-employee connectors — plus the
 * one thing a room needs and a thread does not: an `@` menu. Mentions are how a
 * user hands the next turn to a particular member, so the roster has to be
 * reachable without remembering how each profile is spelled.
 */
export const GroupComposer: FC<GroupComposerProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  members,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const label = placeholder ?? 'Message the room'
  const canSend = !disabled && value.trim().length > 0

  const submit = () => {
    if (!canSend) return
    onSubmit()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // `isComposing` guards IME candidate selection, where Enter commits the
    // candidate and must not send the message.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  return (
    <div className="flex shrink-0 justify-center p-6">
      <form
        className="flex w-full max-w-[720px] flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className={PROMPT_BOX_CLASS} data-prompt-box>
          <div className={EDITOR_WRAPPER_CLASS}>
            <TextareaAutosize
              ref={inputRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={onKeyDown}
              minRows={1}
              maxRows={10}
              disabled={disabled}
              placeholder={label}
              aria-label={label}
              className={EDITOR_CLASS}
            />
          </div>

          <div className={DOCK_CLASS}>
            <div className={DOCK_START_CLASS}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    'flex size-8 items-center justify-center p-0 text-label-md ring-0',
                    buttonVariants({
                      variant: 'icon-secondary',
                      shape: 'pill',
                      size: 'icon-sm',
                    }),
                  )}
                  aria-label="Mention a member"
                  disabled={disabled || members.length === 0}
                >
                  <span aria-hidden>@</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="flex w-54 flex-col gap-1 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
                  side="top"
                  align="start"
                  // Radix's default would return focus to the @ trigger. Send
                  // it to the composer instead — the mention was just inserted
                  // and the user is mid-sentence. Without this the preventDefault
                  // leaves focus on <body> and the next keystrokes go nowhere.
                  onCloseAutoFocus={(event) => {
                    event.preventDefault()
                    inputRef.current?.focus()
                  }}
                >
                  {members.map((member) => (
                    <DropdownMenuItem
                      key={member}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-label-md text-primary"
                      onClick={() => onChange(withMention(value, member))}
                    >
                      <EmployeeAvatar profile={member} size={20} />
                      {member}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className={DOCK_END_CLASS}>
              <Button
                type="submit"
                variant="icon-primary"
                size="icon-sm"
                shape="pill"
                aria-label="Send"
                disabled={!canSend}
              >
                <ArrowUpIcon />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
