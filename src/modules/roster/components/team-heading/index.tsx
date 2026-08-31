import { useNavigate } from 'react-router-dom'
import type { FC } from 'react'
import { AddUserIcon } from '@repo/icons/add-user-icon'
import { PlusIcon } from '@repo/icons/plus'
import { TeamIcon } from '@repo/icons/team'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { useGroupCreateStore } from '@/modules/core/stores/group-create-store'
import { ROUTES } from '../../constants'

/**
 * The "Team" section label and its `+`.
 *
 * The `+` used to *be* hire — a bare link to the Employees catalogue. §1a turns it
 * into a menu: "Hire was the only thing behind the + before. New group joins it —
 * same 24px hit area, same rounded-xl popover as the composer menus." So the hit
 * area is unchanged at 24px and the popover borrows `MoreDropdown`'s geometry,
 * narrowed to the canvas's 212px.
 *
 * New group opens a store rather than navigating: the flow is a modal over
 * whatever is on screen, exactly as Search is, and going to `/groups` first would
 * throw away the page the user was reading.
 */
export const TeamHeading: FC = () => {
  const navigate = useNavigate()
  const openCreate = useGroupCreateStore((state) => state.open)

  return (
    <div className="flex shrink-0 items-center justify-between py-1 pr-3 pl-4">
      <p className="line-clamp-1 text-label-md font-medium text-tertiary">Team</p>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Add to your team"
          className="flex size-6 items-center justify-center rounded-xl text-tertiary hover:bg-fill-secondary"
        >
          <PlusIcon className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="end"
          className="flex w-53 flex-col gap-1 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenuItem
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-label-md text-primary"
            onSelect={openCreate}
          >
            <TeamIcon className="size-4" />
            New group
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-label-md text-primary"
            onSelect={() => navigate(ROUTES.EMPLOYEES)}
          >
            <AddUserIcon className="size-4" />
            Hire an employee
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
