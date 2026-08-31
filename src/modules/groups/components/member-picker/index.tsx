import { useId } from 'react'
import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { cn } from '@repo/ui/cn'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { Spinner } from '@/modules/core/components/spinner'

export interface MemberOption {
  /** Profile name — the only identity a member has in this port. */
  name: string
  /** Whatever the roster knows about the role. Hermes stores none, so it is optional. */
  title?: string
}

/**
 * The one line under the list, which has to answer whichever question the user
 * is currently holding: how many more do I need, or why can I not pick another.
 */
const pickerNote = (count: number, min: number, max: number): string => {
  if (count >= max) return `A room holds ${max} members. Remove one to pick someone else.`
  if (count < min) return `Pick at least ${min}.`
  // §1b's copy. The second sentence is the reason the cap exists, said where the
  // user is deciding how big to go rather than after they have hit it.
  return `Pick up to ${max}. Rooms answer one after another, so a smaller room settles faster.`
}

interface MemberPickerProps {
  available: MemberOption[]
  selected: string[]
  onToggle: (name: string) => void
  min: number
  max: number
  /** The roster is still being fetched, so an empty list is not yet "nobody". */
  isLoading?: boolean
  /** The roster could not be fetched. Shown rather than swallowed. */
  error?: string | null
}

/**
 * Who is in the room.
 *
 * The cap is a real product constraint, not a UI preference — a round is serial,
 * so every extra member is another model call between the user's message and the
 * room settling. Hitting it disables the *unpicked* rows only: a full room still
 * has to be editable, and greying out the row you need to remove is the classic
 * way to strand someone at the limit.
 */
export const MemberPicker: FC<MemberPickerProps> = ({
  available,
  selected,
  onToggle,
  min,
  max,
  isLoading,
  error,
}) => {
  const atMax = selected.length >= max
  const noteId = useId()

  const note = pickerNote(selected.length, min, max)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-label-sm font-medium text-secondary">Members</p>
        <p className="text-label-sm text-tertiary">
          {selected.length} of {max}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-6 text-label-md text-tertiary">
          <Spinner />
          Loading your team…
        </div>
      )}

      {!isLoading && error && <p className="py-6 text-label-md text-critical">{error}</p>}

      {!isLoading && !error && available.length === 0 && (
        <p className="py-6 text-label-md text-tertiary">
          You have no employees yet. Hire one and it can join a room.
        </p>
      )}

      <ul className="scrollbar-minimal flex max-h-66 flex-col gap-0.5 overflow-y-auto">
        {available.map((option) => {
          const isSelected = selected.includes(option.name)
          const blocked = atMax && !isSelected

          return (
            <li key={option.name}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                // The row's visible text is the avatar's alt plus a name plus a
                // title; naming the control explicitly keeps that out of the
                // accessible name.
                aria-label={option.name}
                aria-describedby={blocked ? noteId : undefined}
                disabled={blocked}
                onClick={() => onToggle(option.name)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-fill-variant-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
                  { 'bg-fill-variant-active': isSelected },
                )}
              >
                <EmployeeAvatar profile={option.name} className="size-8" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-label-md text-primary">{option.name}</span>
                  {option.title && (
                    <span className="truncate text-label-xs text-tertiary">{option.title}</span>
                  )}
                </span>
                {isSelected && <CheckIcon className="size-4 shrink-0 text-primary" />}
              </button>
            </li>
          )
        })}
      </ul>

      <p id={noteId} className="text-label-xs text-tertiary">
        {note}
      </p>
    </div>
  )
}
