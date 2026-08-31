import { HermesRpcError } from '@/modules/core/services/hermes/gateway'
import { getHermes } from '@/modules/core/hooks/use-hermes'
import type {
  HermesWireMessage,
  SessionCreateResult,
  SessionResumeResult,
} from '@/modules/core/services/hermes/types'
import {
  GROUP_SESSION_TITLE_PREFIX,
  GROUP_TURN_POLL_MS,
  GROUP_TURN_TIMEOUT_MS,
} from '@/modules/core/constants/groups'
import { isGroupPassText } from '../../utils/pass-text'

/**
 * Driving one member's turn over the shared gateway socket.
 *
 * A room member is an ordinary Hermes profile, so a turn is the ordinary
 * `session.create` / `prompt.submit` / `session.resume` triple. What makes it a
 * *group* turn is only which session it runs in: rooms give each member a
 * session of their own, titled from the room id, so a member's contribution to
 * a room never lands in — or reads from — its 1:1 employee thread.
 *
 * We deliberately do NOT go through `SessionManager`. That class keys one
 * session per profile and hands the same id to every caller, which is exactly
 * the collision we need to avoid. It stays untouched and 1:1 chats keep working.
 *
 * Two wire details here were established against a live gateway, not inferred:
 * `session.create` answers with a short-lived `session_id` (what `prompt.submit`
 * wants) AND a durable `stored_session_id` (what `session.resume` matches on —
 * passing the short id back gets a bare 4007). And a room session must carry
 * `room_plumbing: true`; `tui_gateway/server.py` treats that marker as the
 * explicit contract that exempts a room turn from the stored-runtime model
 * restore, so a member speaks with its CURRENT model rather than whichever one
 * the room's first turn happened to use. `hidden: true` keeps the plumbing out
 * of the user's session list.
 *
 * Progress is polled rather than streamed. Group sessions are unknown to
 * `SessionManager`, so `chat-store.applyEvent` cannot attribute their events —
 * `profileForSession` returns undefined and the frames are dropped. Polling
 * `session.resume` is what the desktop plugin does for the same reason, and it
 * keeps the room engine independent of event delivery.
 */

/** `session not found` — the only error that means "no session, mint one". */
const SESSION_ABSENT_CODE = 4007

const SESSION_COLS = 100
const SESSION_SOURCE = 'employees-ui'

export interface GroupTurnRequest {
  member: string
  prompt: string
  roomId: string
  /** Short-lived id. `prompt.submit` is the ONLY thing that takes this. */
  sessionId: string
  /** Durable key. Every `session.resume` — pre-read and poll — takes this. */
  storedId: string
  /** Log length when the turn was dispatched; the turn resolves the real one. */
  before: number
}

export type GroupTurnStatus = 'failed' | 'replied' | 'stranded'

export interface GroupTurnResult {
  status: GroupTurnStatus
  /** Present only when `status === 'replied'`. A pass is normalised to null. */
  reply: string | null
  /** Present on failure — the wire's machine-readable reason, when it gave one. */
  reason?: string
  /**
   * Where this member's SESSION transcript stood when the turn was dispatched.
   *
   * The caller passes in a room-log length, which is a different counter
   * entirely — a room log grows once per send plus once per member reply, while
   * a member's session grows about twice per turn. The pre-read below resolves
   * the real baseline, and a stranded turn must be harvested from THIS number,
   * not the one it was called with, or the harvest scans an empty range and
   * silently discards a finished answer.
   */
  before: number
}

export function groupSessionTitle(roomId: string): string {
  return `${GROUP_SESSION_TITLE_PREFIX}${roomId}`
}

/** Only the fields the title lookup needs; `session.list` returns more. */
interface SessionListRow {
  id?: string
  resolved_id?: string
  title?: string
}

interface SessionListResult {
  sessions?: SessionListRow[]
}

export interface GroupSessionHandle {
  /** Short-lived id. `prompt.submit` and `session.interrupt` want this one. */
  sessionId: string
  /** Durable key. `session.resume` matches on this; persist it, not the above. */
  storedId: string
}

/**
 * Live (short) session ids by `roomId::member`.
 *
 * Only the durable key is persisted; the short id a turn is running on lives
 * for one page session, and a stop needs it to interrupt the model call that is
 * in flight right now.
 */
const liveSessions = new Map<string, string>()

const liveKey = (roomId: string, member: string): string => `${roomId}::${member}`

export function liveSessionId(roomId: string, member: string): string | undefined {
  return liveSessions.get(liveKey(roomId, member))
}

function isSessionAbsent(error: unknown): boolean {
  return error instanceof HermesRpcError && error.code === SESSION_ABSENT_CODE
}

function messageText(message: HermesWireMessage): string {
  if (typeof message.text === 'string') return message.text
  if (typeof message.content === 'string') return message.content

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          const text = (part as { text?: unknown }).text
          return typeof text === 'string' ? text : ''
        }
        return ''
      })
      .join('')
  }

  return ''
}

/**
 * The reply a finished turn should surface, among the messages appended since
 * `before`.
 *
 * Scans newest-first but prefers the last *substantive* assistant message over
 * a trailing pass: a model that answers and then emits a bare "(pass)" to a
 * follow-up nudge would otherwise have its real answer hidden. Only when
 * nothing but pass text exists in range does the pass win.
 */
export function pickGroupTurnReply(
  messages: HermesWireMessage[],
  before: number,
): string | null {
  let passText: string | null = null

  for (let i = messages.length - 1; i >= before; i--) {
    const message = messages[i]
    if (!message || message.role !== 'assistant') continue

    const text = messageText(message).trim()
    if (!text) continue

    if (isGroupPassText(text)) {
      if (passText === null) passText = text
      continue
    }

    return text
  }

  return passText
}

/**
 * Resolve this member's session for this room, creating it only when the
 * gateway confirms there is genuinely nothing to resume.
 *
 * Fails CLOSED on any error that is not 4007. A network blip read as "no
 * session" would mint a second session for the same member and room, forking
 * its history and orphaning everything it had already said.
 */
export async function ensureGroupSession(
  roomId: string,
  member: string,
  storedId?: string,
): Promise<GroupSessionHandle> {
  const { gateway } = getHermes()
  const title = groupSessionTitle(roomId)

  const resume = async (target: string): Promise<GroupSessionHandle | null> => {
    try {
      const result = await gateway.request<SessionResumeResult>('session.resume', {
        session_id: target,
        profile: member,
        cols: SESSION_COLS,
        omit_messages: true,
      })
      if (!result?.session_id) return null
      liveSessions.set(liveKey(roomId, member), result.session_id)
      return {
        sessionId: result.session_id,
        storedId: result.stored_session_id || target,
      }
    } catch (error) {
      if (!isSessionAbsent(error)) throw error
      return null
    }
  }

  if (storedId) {
    const resumed = await resume(storedId)
    if (resumed) return resumed
  }

  // Title lookup lives on `session.list`, NOT on resume — resume answers 4006
  // without a session_id. The core carries a UNIQUE title index, so an exact
  // title is an identity key and this is an O(1) answer rather than a scan of a
  // recency window a busy profile could have pushed the row out of.
  // `resolved_id` follows a compression lineage to its live tip.
  try {
    const listed = await gateway.request<SessionListResult>('session.list', {
      title,
      profile: member,
    })
    const row = listed?.sessions?.[0]
    const target = row?.resolved_id || row?.id
    if (target) {
      const resumed = await resume(target)
      if (resumed) return resumed
    }
  } catch (error) {
    if (!isSessionAbsent(error)) throw error
  }

  const created = await gateway.request<SessionCreateResult>('session.create', {
    profile: member,
    title,
    cols: SESSION_COLS,
    source: SESSION_SOURCE,
    // The two markers that make this room plumbing rather than a chat.
    hidden: true,
    room_plumbing: true,
  })

  // `request` casts the result without validating it, so the one field the
  // whole room depends on is checked by hand.
  if (!created?.session_id) {
    throw new Error(`session.create for group member "${member}" returned no session_id`)
  }

  liveSessions.set(liveKey(roomId, member), created.session_id)

  return {
    sessionId: created.session_id,
    storedId: created.stored_session_id || created.session_id,
  }
}

/**
 * Read a session's transcript.
 *
 * Takes the DURABLE key. `session.resume` matches on `stored_session_id`, so
 * handing it the short live id — the one `prompt.submit` wants — answers 4007
 * on every poll, and a turn that is genuinely running reads as a dead session.
 */
async function readSession(
  storedId: string,
  member: string,
): Promise<SessionResumeResult> {
  const { gateway } = getHermes()
  return gateway.request<SessionResumeResult>('session.resume', {
    session_id: storedId,
    profile: member,
    cols: SESSION_COLS,
  })
}

/**
 * Run one member's turn to completion, or give up and mark it stranded.
 *
 * A stranded turn is not cancelled — the model call keeps running server-side
 * and its answer is collected by {@link harvestGroupTurn} on a later round.
 * That is the whole reason the timeout is survivable: slow work arrives late
 * rather than being lost, and the room does not block on it.
 */
export async function runGroupTurn(
  request: GroupTurnRequest,
  isCurrent: () => boolean,
): Promise<GroupTurnResult> {
  const { gateway } = getHermes()

  let before = request.before
  try {
    const pre = await readSession(request.storedId, request.member)
    before = Array.isArray(pre?.messages) ? pre.messages.length : before
  } catch {
    // A failed pre-read only costs us a less precise starting index; the turn
    // itself is still worth attempting.
  }

  try {
    await gateway.request('prompt.submit', {
      session_id: request.sessionId,
      text: request.prompt,
    })
  } catch (error) {
    return {
      status: 'failed',
      reply: null,
      reason: failureReason(error),
      before,
    }
  }

  const deadline = Date.now() + GROUP_TURN_TIMEOUT_MS

  while (Date.now() < deadline) {
    await delay(GROUP_TURN_POLL_MS)

    if (!isCurrent()) return { status: 'stranded', reply: null, before }

    let state: SessionResumeResult
    try {
      state = await readSession(request.storedId, request.member)
    } catch (error) {
      if (isSessionAbsent(error)) {
        return { status: 'failed', reply: null, reason: 'session_gone', before }
      }
      // A transient read failure is not a failed turn — keep polling.
      continue
    }

    if (state?.running) continue

    const messages = Array.isArray(state?.messages) ? state.messages : []
    const reply = pickGroupTurnReply(messages, before)

    return {
      status: 'replied',
      reply: reply !== null && isGroupPassText(reply) ? null : reply,
      before,
    }
  }

  return { status: 'stranded', reply: null, before }
}

/**
 * Collect a turn that finished after its round moved on.
 *
 * Returns `undefined` while the member is still working — the marker stays and
 * the next round tries again. Returns a result (possibly a null reply, for a
 * pass) once the session is idle, at which point the caller drops the marker.
 */
export async function harvestGroupTurn(
  roomId: string,
  member: string,
  storedId: string,
  before: number,
): Promise<GroupTurnResult | undefined> {
  // Resolve the live id from the durable key: the short session id a turn was
  // dispatched on can have rolled over, and resume is the only thing that maps
  // one to the other.
  let handle: GroupSessionHandle
  try {
    handle = await ensureGroupSession(roomId, member, storedId)
  } catch {
    return undefined
  }

  let state: SessionResumeResult
  try {
    state = await readSession(handle.storedId, member)
  } catch (error) {
    if (isSessionAbsent(error)) {
      return { status: 'failed', reply: null, reason: 'session_gone', before }
    }
    return undefined
  }

  if (state?.running) return undefined

  const messages = Array.isArray(state?.messages) ? state.messages : []

  // Nothing has landed since the turn was dispatched. Treat that as "still
  // pending" rather than "answered with silence", so the marker survives and a
  // later round can collect the reply instead of clearing it unread.
  if (messages.length <= before) return undefined

  const reply = pickGroupTurnReply(messages, before)

  return {
    status: 'replied',
    reply: reply !== null && isGroupPassText(reply) ? null : reply,
    before,
  }
}

export async function interruptGroupMember(sessionId: string): Promise<void> {
  const { gateway } = getHermes()
  try {
    await gateway.request('session.interrupt', { session_id: sessionId })
  } catch {
    // Best-effort: an unreachable member still leaves the room stopped, because
    // the round loop's epoch check abandons the turn regardless.
  }
}

function failureReason(error: unknown): string | undefined {
  if (error instanceof HermesRpcError) {
    const data = error.data
    if (data && typeof data === 'object' && 'reason' in data) {
      const reason = (data as { reason?: unknown }).reason
      if (typeof reason === 'string' && reason.trim()) return reason.trim()
    }
    return `rpc_${error.code}`
  }
  return undefined
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
