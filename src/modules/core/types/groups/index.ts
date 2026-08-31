/**
 * The vocabulary of a group room.
 *
 * A room is one ordered log plus per-member bookkeeping. Every member reads the
 * same log but is *fed* only what is new since its own last turn — the
 * watermark map is what makes that possible, and it is the reason a room can
 * hold six employees without six copies of the transcript.
 *
 * Ported from the desktop Bot Mode plugin (`apps/desktop/src/plugins/computer-bots`).
 * Cross-machine members are deliberately out of scope here: the desktop relays
 * those through its own socket pool, which a browser has no equivalent of, so a
 * member is always a local profile name.
 */

export type GroupAuthorKind = 'member' | 'user'

export interface GroupMessageAuthor {
  kind: GroupAuthorKind
  /** Profile name for a member; the viewer's label for a user entry. */
  name: string
}

export interface GroupMessage {
  id: string
  /** Milliseconds. */
  at: number
  from: GroupMessageAuthor
  text: string
  /** Which conversation within the room this entry belongs to. */
  thread: string
}

/**
 * A member the user told to stop. Held members are skipped until explicitly
 * released, and `noted` records that the room already explained the silence
 * once so the activity feed does not repeat itself.
 */
export interface GroupHold {
  at: number
  noted: boolean
}

/**
 * A turn that outlived its timeout. The reply is not lost — the next round
 * harvests it — so the marker records how far the log had grown when the turn
 * was dispatched, which is where the harvest starts reading.
 */
export interface GroupStrandedTurn {
  before: number
  thread: string
}

export interface GroupRoom {
  /**
   * Immutable identity. Member sessions are titled from this rather than from
   * `name`, so renaming a room cannot fork its sessions and a delete-then-
   * recreate under the same name cannot resume the old room's history.
   */
  id: string
  name: string
  /** Profile names. Order is the seating order; rotation derives from it. */
  members: string[]
  log: GroupMessage[]
  /** `${thread}::${member}` → how far that member has read into `log`. */
  watermarks: Record<string, number>
  /** member → gateway session id for this room. */
  sessions: Record<string, string>
  holds: Record<string, GroupHold>
  stranded: Record<string, GroupStrandedTurn>
  /**
   * Bumped by every user send. An in-flight turn whose epoch no longer matches
   * is abandoned rather than committed, which is what stops a superseded round
   * from double-posting.
   */
  epoch: number
  running: boolean
  /** Runtime only: the member whose model call is in flight right now. */
  turn: string | null
  /** Runtime only: 1-based round the current drive is on; 0 when idle. */
  round: number
  /** How the last drive ended, for the room's status line. */
  lastExit: GroupRoundExit | null
  createdAt: number
}

/** What a round did, for the room's status line. */
export type GroupRoundExit = 'cancelled' | 'capped' | 'settled'

export interface GroupMentionParse {
  mentioned: Set<string>
  everyone: boolean
}
