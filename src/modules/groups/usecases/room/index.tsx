import { useState } from 'react'
import type { FC } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GroupClusterAvatar } from '@/modules/core/components/group-cluster-avatar'
import { ROUTES } from '@/modules/roster/constants'
import { AddMemberDialog } from '../../components/add-member-dialog'
import { GroupComposer } from '../../components/group-composer'
import { GroupMessageList } from '../../components/group-message-list'
import { GroupMembersPanel } from '../../components/group-members-panel'
import { RenameGroupDialog } from '../../components/rename-group-dialog'
import { useGroupCandidates } from '../../hooks/use-group-candidates'
import { useGroupRoom } from '../../hooks/use-group-room'

/**
 * One room, opened from the Team list.
 *
 * Laid out as the one-to-one thread is — 48px header, a 768px column, the composer
 * in a fixed footer — because §1d/1e put a room in the same slot an employee thread
 * occupies and a different shape would read as a different kind of place.
 *
 * What is deliberately *absent* is as specified as what is here. §1e: "No round
 * counters, no pass rows: the machinery stays out of sight." The rotation, the
 * three-round cap, the pass text and the settle/cap/cancel exit are all real and
 * all invisible; the only turn-order cue in the product is one member's "is
 * typing…". An earlier build surfaced a round counter and a Stop button in this
 * header — both are gone on purpose, and Stop with them, since a room that cannot
 * be seen counting is a room nobody needs to interrupt.
 */
export const GroupRoomView: FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const room = useGroupRoom(roomId)
  const { candidates, isLoading, error } = useGroupCandidates()

  const [isAdding, setIsAdding] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)

  // A deleted room, or a link to one this browser has never held. Rooms are
  // device-local, so a shared URL lands here rather than on someone else's room.
  if (!roomId || !room.exists) return <Navigate to={ROUTES.GROUPS} replace />

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between px-4">
        <span className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1">
          <GroupClusterAvatar members={room.members} size="xs" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-label-md font-medium text-primary">{room.name}</span>
            <span className="text-label-xs text-tertiary">
              {room.members.length} members
            </span>
          </span>
        </span>

        <GroupMembersPanel
          members={room.members}
          onAddMember={() => setIsAdding(true)}
          onRemoveMember={room.removeMember}
          onRename={() => setIsRenaming(true)}
          onDelete={() => {
            room.remove()
            navigate(ROUTES.GROUPS, { replace: true })
          }}
        />
      </header>

      {room.messages.length === 0 && !room.speaking ? (
        <EmptyRoom members={room.members} />
      ) : (
        <GroupMessageList
          messages={room.messages}
          viewer="You"
          membersTyping={room.speaking ? [room.speaking] : []}
        />
      )}

      <GroupComposer
        value={room.draft}
        onChange={room.setDraft}
        onSubmit={room.send}
        disabled={room.running}
        members={room.members}
        placeholder="Message the group"
      />

      <AddMemberDialog
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onAdd={room.addMember}
        available={candidates}
        members={room.members}
        isLoading={isLoading}
        error={error}
      />

      <RenameGroupDialog
        open={isRenaming}
        onClose={() => setIsRenaming(false)}
        onRename={room.rename}
        name={room.name}
      />
    </div>
  )
}

/**
 * §1d: "The empty state names who is in the room and what one message will do."
 *
 * Both halves matter. The names answer "who did I just put in here", which the
 * truncated sidebar row cannot; the second line says a single message starts the
 * whole room, which is the one thing about turn-taking a new user has to know.
 */
const EmptyRoom: FC<{ members: string[] }> = ({ members }) => (
  <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-6">
    <div className="mx-auto flex max-w-[768px] flex-col items-center gap-3 py-20 text-center">
      <GroupClusterAvatar members={members} size="lg" />
      <p className="text-heading-sm text-primary">{members.join(', ')}</p>
      <p className="max-w-[360px] text-label-md text-tertiary">
        Nothing here yet. Describe the work and the {spellOut(members.length)} of them will
        pick it up in turn.
      </p>
    </div>
  </div>
)

/** The cap is six, so the sentence never needs a numeral. */
const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six'] as const
const spellOut = (n: number): string => WORDS[n] ?? String(n)
