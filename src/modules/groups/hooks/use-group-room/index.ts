import { useCallback, useMemo, useState } from 'react'
import { GROUP_MAX_MEMBERS, GROUP_MAX_ROUNDS } from '@/modules/core/constants/groups'
import { sendToGroupRoom, stopGroupRoom } from '../../services/send-to-room'
import { useGroupStore } from '@/modules/core/stores/group-store'
import type { GroupMessage, GroupRoundExit } from '@/modules/core/types/groups'

/**
 * One room's view model: what to render, and the two things a user can do.
 *
 * The composer's `send` deliberately does not await the drive. A room takes as
 * long as its slowest member, and blocking the input on that would make the
 * surface feel broken while it is in fact working.
 */

export interface UseGroupRoomResult {
  name: string
  members: string[]
  messages: GroupMessage[]
  /** The member mid-turn right now, for the working indicator. */
  speaking: string | null
  running: boolean
  /** Members the user told to stop; they stay quiet until addressed again. */
  heldMembers: string[]
  maxRounds: number
  /** 1-based round the drive is on; 0 when idle. */
  round: number
  /** How the last drive ended. */
  exit: GroupRoundExit | null
  draft: string
  setDraft: (draft: string) => void
  send: () => void
  stop: () => void
  exists: boolean
  /** Seats still free, for the add-member surfaces. §1f counts the cap here. */
  seatsLeft: number
  rename: (name: string) => void
  addMember: (member: string) => void
  removeMember: (member: string) => void
  remove: () => void
}

export function useGroupRoom(roomId: string | undefined): UseGroupRoomResult {
  const room = useGroupStore((state) => (roomId ? state.rooms[roomId] : undefined))
  // Drafts are per ROOM, not per surface. Switching rooms does not remount this
  // hook, so a single string would carry half-typed text from one room into the
  // next and send it to the wrong people.
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const draft = roomId ? drafts[roomId] ?? '' : ''

  const setDraft = useCallback(
    (next: string) => {
      if (!roomId) return
      setDrafts((current) => ({ ...current, [roomId]: next }))
    },
    [roomId],
  )

  const heldMembers = useMemo(
    () => (room ? Object.keys(room.holds) : []),
    [room],
  )

  const send = useCallback(() => {
    if (!roomId) return

    const text = draft.trim()
    if (!text) return

    // Clear optimistically: the entry is appended synchronously by
    // `sendToGroupRoom`, so the transcript already shows it on the next render.
    setDrafts((current) => ({ ...current, [roomId]: '' }))
    sendToGroupRoom({ roomId, text })
  }, [draft, roomId])

  const stop = useCallback(() => {
    if (roomId) stopGroupRoom(roomId)
  }, [roomId])

  const members = useMemo(() => room?.members ?? [], [room])

  const rename = useCallback(
    (name: string) => {
      if (roomId) useGroupStore.getState().renameRoom(roomId, name)
    },
    [roomId],
  )

  /*
   * Appended, never inserted. Seating order is the rotation order, so a new
   * member speaks last in the round they join — which is also the only order in
   * which §1f's promise holds, that "a new member reads the conversation so far
   * before their first answer".
   */
  const addMember = useCallback(
    (member: string) => {
      if (!roomId || !member) return
      const current = useGroupStore.getState().rooms[roomId]
      if (!current || current.members.includes(member)) return
      if (current.members.length >= GROUP_MAX_MEMBERS) return
      useGroupStore.getState().setMembers(roomId, [...current.members, member])
    },
    [roomId],
  )

  const removeMember = useCallback(
    (member: string) => {
      if (!roomId) return
      const current = useGroupStore.getState().rooms[roomId]
      if (!current) return
      useGroupStore.getState().setMembers(
        roomId,
        current.members.filter((name) => name !== member),
      )
    },
    [roomId],
  )

  const remove = useCallback(() => {
    if (roomId) useGroupStore.getState().deleteRoom(roomId)
  }, [roomId])

  return {
    draft,
    exists: Boolean(room),
    exit: room?.lastExit ?? null,
    heldMembers,
    maxRounds: GROUP_MAX_ROUNDS,
    members,
    messages: room?.log ?? [],
    name: room?.name ?? '',
    round: room?.round ?? 0,
    running: room?.running ?? false,
    send,
    setDraft,
    speaking: room?.turn ?? null,
    stop,
    seatsLeft: Math.max(0, GROUP_MAX_MEMBERS - members.length),
    rename,
    addMember,
    removeMember,
    remove,
  }
}
