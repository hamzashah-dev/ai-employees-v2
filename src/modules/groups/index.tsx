import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@repo/ui/button'
import { GroupClusterAvatar } from '@/modules/core/components/group-cluster-avatar'
import { useGroupCreateStore } from '@/modules/core/stores/group-create-store'
import { useGroupStore } from '@/modules/core/stores/group-store'
import { toGroupRow } from '@/modules/core/utils/group-row'
import { formatRosterTime } from '@/modules/core/utils/time'
import { ROUTES } from '@/modules/roster/constants'

/**
 * Every room, at `/groups`.
 *
 * The rooms themselves open from the Team list (§1d) — this is the index behind the
 * "Groups" nav row, which the canvas keeps drawing in every sidebar. It is the one
 * place that can say what a room *is*, and the one place the honest caveat about
 * where rooms live belongs, because a sidebar row has no space for it.
 */
export const GroupsView: FC = () => {
  const rooms = useGroupStore((state) => state.rooms)
  const openCreate = useGroupCreateStore((state) => state.open)

  const list = Object.values(rooms)
    .map(toGroupRow)
    .sort((a, b) => b.activityMs - a.activityMs || a.name.localeCompare(b.name))

  return (
    <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-6">
      <div className="mx-auto flex max-w-[768px] flex-col gap-5 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-sm text-primary">Groups</h1>
            <p className="text-label-md text-tertiary">
              Two to six of your employees in one room, answering in turn.
            </p>
          </div>
          <Button onClick={openCreate}>New group</Button>
        </div>

        {list.length === 0 ? (
          <p className="max-w-[420px] text-label-md text-tertiary">
            No groups yet. A group puts two to six of your employees in one room; they take
            turns, and the ones with nothing to add stay quiet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {list.map((row) => (
              <li key={row.id}>
                <Link
                  to={`${ROUTES.GROUPS}/${encodeURIComponent(row.id)}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-fill-variant-hover"
                >
                  <GroupClusterAvatar members={row.members} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-label-md font-medium text-primary">
                        {row.name}
                      </span>
                      <span className="shrink-0 text-label-xs text-tertiary">
                        {formatRosterTime(row.activityMs)}
                      </span>
                    </span>
                    <span className="truncate text-label-sm text-tertiary">{row.subtitle}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/*
          Not a disclaimer to be tidied away later. There is no rooms table, no room
          endpoint and no user record to hang one off — `services/group-persistence`
          has the detail — so a room is a property of this browser, like the theme.
          Implying a teammate on another machine sees the same list would be a lie
          the user only discovers when they go looking for it.
        */}
        <p className="text-label-sm text-tertiary">
          Groups are saved in this browser only. Hermes has nowhere to store a room, so they
          will not follow you to another machine.
        </p>
      </div>
    </div>
  )
}
