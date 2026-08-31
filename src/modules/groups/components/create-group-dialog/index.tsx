import { useId, useMemo, useState } from 'react'
import type { FC } from 'react'
import { PlusIcon } from '@repo/icons/plus'
import { XIcon } from '@repo/icons/x'
import { Button } from '@repo/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@repo/ui/dialog'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { GroupClusterAvatar } from '@/modules/core/components/group-cluster-avatar'
import { GROUP_MAX_MEMBERS, GROUP_MIN_MEMBERS } from '@/modules/core/constants/groups'
import { GROUP_FIELD } from '../../constants'
import { MemberPicker } from '../member-picker'
import type { MemberOption } from '../member-picker'

interface CreateGroupDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, members: string[]) => void
  available: MemberOption[]
  isLoading?: boolean
  error?: string | null
}

/**
 * Making a room, in the two steps §1b and §1c draw.
 *
 * The split is not decoration. Picking is where the cap is spent and where the
 * room's identity is actually decided; naming is a formality the flow can offer a
 * complete answer to. Doing both at once — as the first build did — makes the user
 * name something they have not finished assembling, and the canvas's default name
 * *is* the members, which cannot be suggested until they are picked.
 *
 * Radix unmounts the portal on close, so both steps die with it: a half-picked room
 * or an abandoned name never greets the next person who opens this.
 */
export const CreateGroupDialog: FC<CreateGroupDialogProps> = ({
  open,
  onClose,
  onCreate,
  available,
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
      <CreateGroupFlow
        onClose={onClose}
        onCreate={onCreate}
        available={available}
        isLoading={isLoading}
        error={error}
      />
    </DialogContent>
  </Dialog>
)

const CreateGroupFlow: FC<Omit<CreateGroupDialogProps, 'open'>> = ({
  onClose,
  onCreate,
  available,
  isLoading,
  error,
}) => {
  const [step, setStep] = useState<'members' | 'name'>('members')
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const fieldId = useId()

  /*
   * §1c: "the members' names are the default". Derived rather than stored, so
   * stepping back and changing the room updates the suggestion — until the user
   * types, at which point `name` holds their words and wins.
   */
  const suggestion = useMemo(() => selected.join(', '), [selected])
  const value = name || suggestion
  const trimmed = value.trim()

  const toggle = (member: string) =>
    setSelected((current) =>
      current.includes(member)
        ? current.filter((entry) => entry !== member)
        : current.length >= GROUP_MAX_MEMBERS
          ? current
          : [...current, member],
    )

  if (step === 'members') {
    return (
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-label-lg font-medium text-primary">New group</DialogTitle>
          <DialogDescription className="text-label-sm text-secondary">
            Everyone you pick reads the whole room and answers in turn.
          </DialogDescription>
        </div>

        {/*
          §1b: "Picked members stack into the group's avatar as you go, so the row
          you'll see in the sidebar is built in front of you." This is that row, at
          40px — the same cluster the sidebar will draw, not a preview of one.
        */}
        <div className="flex items-center gap-3 rounded-2xl bg-fill-elevated p-3">
          <GroupClusterAvatar members={selected} size="md" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-label-md font-medium text-primary">
              {suggestion || 'Nobody picked yet'}
            </span>
            <span className="text-label-xs text-tertiary">
              {selected.length} of {GROUP_MAX_MEMBERS} picked
            </span>
          </span>
        </div>

        <MemberPicker
          available={available}
          selected={selected}
          onToggle={toggle}
          min={GROUP_MIN_MEMBERS}
          max={GROUP_MAX_MEMBERS}
          isLoading={isLoading}
          error={error}
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={selected.length < GROUP_MIN_MEMBERS} onClick={() => setStep('name')}>
            Next
          </Button>
        </DialogFooter>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (!trimmed) return
        onCreate(trimmed, selected)
      }}
    >
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-heading-xs text-primary">Name the group</DialogTitle>
        <DialogDescription className="text-label-md text-tertiary">
          Everyone in it can see the name. You can change it later.
        </DialogDescription>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId} className="text-label-sm font-medium text-secondary">
          Group name
        </label>
        {/*
          §1c: "Field arrives pre-filled and selected, so Enter is a complete
          answer." `select()` on mount is what makes typing replace rather than
          append — without it the user has to clear three names by hand first.
        */}
        <input
          id={fieldId}
          value={value}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => setName(event.target.value)}
          className={GROUP_FIELD}
        />
        <p className="text-label-xs text-tertiary">
          Suggested from the members you picked. Type to replace it.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-sm font-medium text-secondary">
          Members · {selected.length} of {GROUP_MAX_MEMBERS}
        </p>

        {/* §1c: "Members are editable chips, not a locked summary." */}
        <div className="flex flex-wrap gap-2">
          {selected.map((member) => (
            <span
              key={member}
              className="flex items-center gap-2 rounded-full bg-fill-elevated py-1 pr-2.5 pl-1"
            >
              <EmployeeAvatar profile={member} className="size-6" />
              <span className="text-label-sm text-primary">{member}</span>
              {selected.length > GROUP_MIN_MEMBERS && (
                <button
                  type="button"
                  aria-label={`Remove ${member}`}
                  onClick={() => toggle(member)}
                  className="flex text-tertiary hover:text-primary"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </span>
          ))}

          {selected.length < GROUP_MAX_MEMBERS && (
            <button
              type="button"
              onClick={() => setStep('members')}
              className="flex h-8 items-center gap-1.5 rounded-full border border-secondary px-2.5 text-label-sm text-primary hover:bg-fill-variant-hover"
            >
              <PlusIcon className="size-4" />
              Add
            </button>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={() => setStep('members')}>
          Back
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!trimmed}>
          Create group
        </Button>
      </DialogFooter>
    </form>
  )
}
