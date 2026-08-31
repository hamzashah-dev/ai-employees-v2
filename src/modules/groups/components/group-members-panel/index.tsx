import type { FC } from 'react'
import { AddUserIcon } from '@repo/icons/add-user-icon'
import { MoreHorizontalIcon } from '@repo/icons/more-horizontal'
import { StartNewIcon } from '@repo/icons/start-new-icon'
import { XIcon } from '@repo/icons/x'
import { cn } from '@repo/ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { GROUP_MAX_MEMBERS, GROUP_MIN_MEMBERS } from '@/modules/core/constants/groups'

interface GroupMembersPanelProps {
  members: string[]
  onAddMember: () => void
  onRemoveMember: (member: string) => void
  onRename: () => void
  onDelete: () => void
}

const ACTION_ROW = 'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-label-md'

/**
 * The room's `⋯` — who is in here, and the three things you can do about it (§1f).
 *
 * "Members panel off the header ⋯", 264px, listing the room before its actions so
 * the count you are about to spend is above the control that spends it.
 *
 * One departure from the canvas, and it is deliberate: the canvas draws the member
 * rows with no remove control, but the add-member dialog's own copy promises that
 * "members already here can be removed from the members panel". Something has to
 * give, and dropping the promise would strand a full room with no way back under
 * the cap. So each member carries a hover-revealed `×` — the same remove idiom
 * §1c already uses on its chips — rather than inventing a new surface for it.
 *
 * Removal stops at the minimum. A one-member room is not a room, and silently
 * letting it become one would leave a "group" that is just a worse thread.
 */
export const GroupMembersPanel: FC<GroupMembersPanelProps> = ({
  members,
  onAddMember,
  onRemoveMember,
  onRename,
  onDelete,
}) => {
  const isFull = members.length >= GROUP_MAX_MEMBERS
  const canRemove = members.length > GROUP_MIN_MEMBERS

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Group options"
        className="flex size-7 items-center justify-center rounded-full text-secondary hover:bg-fill-variant-hover"
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className="flex w-66 flex-col gap-0.5 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <p className="px-2.5 py-1.5 text-label-xs text-tertiary">
          Members · {members.length} of {GROUP_MAX_MEMBERS}
        </p>

        {members.map((member) => (
          <div
            key={member}
            className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-fill-variant-hover"
          >
            <EmployeeAvatar profile={member} size={24} />
            <span className="flex-1 truncate text-label-md text-primary">{member}</span>
            {canRemove && (
              <button
                type="button"
                aria-label={`Remove ${member}`}
                onClick={() => onRemoveMember(member)}
                className="hidden shrink-0 text-tertiary hover:text-primary group-hover:block"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
        ))}

        <span aria-hidden className="mx-2.5 my-1.5 h-px bg-primary" />

        <DropdownMenuItem
          className={cn(ACTION_ROW, 'text-primary')}
          disabled={isFull}
          onSelect={onAddMember}
        >
          <AddUserIcon className="size-4" />
          Add member
        </DropdownMenuItem>

        <DropdownMenuItem className={cn(ACTION_ROW, 'text-primary')} onSelect={onRename}>
          <StartNewIcon className="size-4" />
          Rename group
        </DropdownMenuItem>

        <DropdownMenuItem className={cn(ACTION_ROW, 'text-critical')} onSelect={onDelete}>
          <XIcon className="size-4" />
          Delete group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
