import { useState } from 'react'
import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@repo/ui/dialog'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { GROUP_MAX_MEMBERS } from '@/modules/core/constants/groups'
import { Spinner } from '@/modules/core/components/spinner'
import type { MemberOption } from '../member-picker'

/** Small counts read better as words in a sentence. The cap is 6, so this is total. */
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'] as const
const spellCount = (n: number): string => WORDS[n] ?? String(n)

interface AddMemberDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (member: string) => void
  /** Everyone on the roster, seated or not. */
  available: MemberOption[]
  /** Who is already in the room, in seating order. */
  members: string[]
  isLoading?: boolean
  error?: string | null
}

/**
 * Adding one more employee to a room that already exists (§1f).
 *
 * The rule that shapes it: "Already-seated bots stay listed and unpickable, so the
 * 6 cap is counted where it's spent." Hiding them would make the room look emptier
 * than it is and leave the user wondering why the count says 3 of 6 when they can
 * only see three names — so everyone is listed, and the seated ones carry their
 * status instead of a checkbox.
 *
 * One at a time, deliberately. Each addition re-seats the rotation and the new
 * member reads the whole log before answering; batching would hide which of three
 * new voices was responsible for the room's next turn.
 */
export const AddMemberDialog: FC<AddMemberDialogProps> = ({
  open,
  onClose,
  onAdd,
  available,
  members,
  isLoading,
  error,
}) => (
  <Dialog
    open={open}
    onOpenChange={(next) => {
      if (!next) onClose()
    }}
  >
    <DialogContent className="max-w-[480px] gap-0 rounded-3xl border-secondary bg-surface p-0">
      <AddMemberForm
        onClose={onClose}
        onAdd={onAdd}
        available={available}
        members={members}
        isLoading={isLoading}
        error={error}
      />
    </DialogContent>
  </Dialog>
)

const AddMemberForm: FC<Omit<AddMemberDialogProps, 'open'>> = ({
  onClose,
  onAdd,
  available,
  members,
  isLoading,
  error,
}) => {
  const [picked, setPicked] = useState<string | null>(null)

  const seated = new Set(members)
  const seatsLeft = Math.max(0, GROUP_MAX_MEMBERS - members.length)
  const isFull = seatsLeft === 0

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-heading-xs text-primary">Add to this group</DialogTitle>
        <DialogDescription className="text-label-md text-tertiary">
          A new member reads the conversation so far before their first answer.
        </DialogDescription>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className="text-label-md font-medium text-secondary">Your employees</p>
        <p className="text-label-sm text-tertiary">
          {members.length} of {GROUP_MAX_MEMBERS}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-6 text-label-md text-tertiary">
          <Spinner />
          Loading your team…
        </div>
      )}

      {!isLoading && error && <p className="py-6 text-label-md text-critical">{error}</p>}

      {!isLoading && !error && (
        <ul className="scrollbar-minimal flex max-h-[280px] flex-col gap-0.5 overflow-y-auto">
          {available.map((option) => {
            const isSeated = seated.has(option.name)
            const isPicked = picked === option.name
            // A full room can still show who is in it; only picking is barred.
            const disabled = isSeated || (isFull && !isPicked)

            return (
              <li key={option.name}>
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={isPicked}
                  onClick={() => setPicked(isPicked ? null : option.name)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors duration-200 ease-linear',
                    {
                      'hover:bg-fill-variant-hover': !disabled,
                      'bg-fill-variant-active': isPicked,
                      'cursor-not-allowed opacity-50': disabled,
                    },
                  )}
                >
                  <EmployeeAvatar profile={option.name} />

                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-label-md font-medium text-primary">
                      {option.name}
                    </span>
                    {/* No description is honest silence — Hermes leaves it empty often. */}
                    {option.title && (
                      <span className="truncate text-label-sm text-tertiary">{option.title}</span>
                    )}
                  </span>

                  {isSeated && (
                    <span className="shrink-0 text-label-sm text-tertiary">In this group</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-label-sm text-tertiary">
        {isFull
          ? `A room holds ${GROUP_MAX_MEMBERS}. Remove someone from the members panel to add another.`
          : `${spellCount(seatsLeft)} seat${seatsLeft === 1 ? '' : 's'} left. Members already here can be removed from the members panel.`}
      </p>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!picked}
          onClick={() => {
            if (!picked) return
            onAdd(picked)
            onClose()
          }}
        >
          {picked ? `Add ${picked}` : 'Add member'}
        </Button>
      </DialogFooter>
    </div>
  )
}
