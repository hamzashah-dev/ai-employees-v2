import { HermesRpcError } from './gateway'
import type { HermesGateway } from './gateway'
import type {
  FileAttachResult,
  PromptSubmitResult,
  SessionCreateResult,
  SessionHistoryResult,
  SessionListResult,
  SessionResumeResult,
} from './types'

/**
 * Maps an employee's *conversations* onto live gateway sessions.
 *
 * An employee is a Hermes profile and a profile has many sessions — the TUI's,
 * the desktop's, its routines', and one per conversation the user starts here.
 * So the unit of address is a `ThreadRef`: the profile plus the DURABLE session
 * id (`stored_session_id`, the `20260914_074402_74eb85` key that
 * `GET /api/sessions` also calls `id`). That key is what the URL carries, which
 * is why a thread survives a reload, a reconnect and a tab share.
 *
 * `session.create` binds the profile for the session's whole life —
 * `prompt.submit` has no profile parameter — so getting the binding wrong once
 * means every later message in that thread goes to the wrong agent.
 *
 * Opening a ref RESUMES that conversation; it never creates. Creating is now an
 * explicit act (`createSession`, behind "New session") rather than a fallback,
 * because a silent create is indistinguishable from a resume that failed and
 * `session.create` mints a fresh key — so the old conversation is still on disk
 * and the user is simply no longer in it. Starting a session the user did not
 * ask for is how a thread forks and a transcript appears to vanish.
 */

/** `session not found` — the only error that means "nothing to resume". */
const SESSION_ABSENT_CODE = 4007

const SESSION_COLS = 100

/**
 * Stamped on every session this app creates, and preferred when choosing which
 * one to resume: a profile also accumulates sessions from the TUI, the desktop
 * and its own routines, and resuming a cron run as if it were the user's chat
 * would splice unrelated turns into the thread.
 */
const SESSION_SOURCE = 'employees-ui'

/**
 * How far back to look for a conversation to resume. `session.list` answers
 * newest-first, so this only bounds how deep the source preference can reach.
 */
const SESSION_LOOKBACK = 20

export interface KnownProfileSource {
  /** Names that actually exist on the backend. */
  listProfileNames: () => Promise<string[]>
}

export class UnknownProfileError extends Error {
  constructor(readonly profile: string, readonly known: string[]) {
    super(
      `Unknown employee "${profile}". Known: ${known.join(', ') || '(none)'}. ` +
        `Refusing to start a session, because Hermes would silently fall back ` +
        `to the default agent instead of reporting an error.`,
    )
    this.name = 'UnknownProfileError'
  }
}

export class SessionNotFoundError extends Error {
  constructor(readonly ref: ThreadRef) {
    super(
      `Session "${ref.sessionId}" does not exist for employee "${ref.profile}". ` +
        `It may have been deleted, or the link may be from another machine.`,
    )
    this.name = 'SessionNotFoundError'
  }
}

/** The durable address of one conversation: an employee plus a stored session key. */
export interface ThreadRef {
  profile: string
  /** `stored_session_id` — the durable key, and what the URL carries. */
  sessionId: string
}

/** Map key for a ref. NUL cannot occur in a profile name or a session key. */
export function refKey(ref: ThreadRef): string {
  return `${ref.profile}\u0000${ref.sessionId}`
}

interface SessionEntry extends ThreadRef {
  /** The short-lived gateway id. Stale after a reconnect; the ref is not. */
  liveId: string
}

export class SessionManager {
  private readonly byRef = new Map<string, SessionEntry>()
  private readonly inFlight = new Map<string, Promise<SessionEntry>>()
  /** Reverse index for inbound events, which carry only the live id. */
  private readonly byLiveId = new Map<string, ThreadRef>()
  private knownProfiles: string[] | null = null

  constructor(
    private readonly gateway: HermesGateway,
    private readonly profiles: KnownProfileSource,
  ) {}

  /** Which conversation does an inbound event belong to? */
  refForSession(liveId: string): ThreadRef | undefined {
    return this.byLiveId.get(liveId)
  }

  /** The live gateway id for a ref, if it is currently open. */
  liveIdFor(ref: ThreadRef): string | undefined {
    return this.byRef.get(refKey(ref))?.liveId
  }

  /**
   * Drop cached live sessions after a reconnect, where every `session_id` is
   * stale. Nothing durable is lost: a ref is the address, and the open thread
   * re-resumes from the one in its URL.
   */
  reset(): void {
    this.byRef.clear()
    this.inFlight.clear()
    this.byLiveId.clear()
  }

  invalidateProfileCache(): void {
    this.knownProfiles = null
  }

  /**
   * Start a new conversation and return its durable key for the URL.
   *
   * Only ever called from an explicit "new session" action. Nothing resumes
   * into a created session, so an accidental call strands the user in an empty
   * thread while their real one sits on disk.
   */
  async createSession(profile: string): Promise<string> {
    await this.assertProfileExists(profile)
    const result = await this.gateway.request<SessionCreateResult>('session.create', {
      profile,
      cols: SESSION_COLS,
      source: SESSION_SOURCE,
    })

    if (!result?.session_id) {
      throw new Error(`session.create for "${profile}" returned no session_id`)
    }
    /*
     * The durable key is the whole point of the call here: without it there is
     * no address to navigate to, and the session would be reachable only for as
     * long as this socket lives.
     */
    if (!result.stored_session_id) {
      throw new Error(
        `session.create for "${profile}" returned no stored_session_id, so the new ` +
          `session has no durable address to open.`,
      )
    }

    const ref = { profile, sessionId: result.stored_session_id }
    this.remember({ ...ref, liveId: result.session_id })
    return ref.sessionId
  }

  /**
   * Open a conversation, returning its live gateway id.
   *
   * Deduped per ref: two components mounting the same thread must not both
   * resume it, which would leave two live ids for one conversation and route
   * half its events into a session nobody is reading.
   */
  async ensureSession(ref: ThreadRef): Promise<string> {
    const key = refKey(ref)
    const existing = this.byRef.get(key)
    if (existing) return existing.liveId

    const pending = this.inFlight.get(key)
    if (pending) return (await pending).liveId

    const opening = this.openSession(ref)
    this.inFlight.set(key, opening)
    try {
      return (await opening).liveId
    } finally {
      this.inFlight.delete(key)
    }
  }

  private async openSession(ref: ThreadRef): Promise<SessionEntry> {
    await this.assertProfileExists(ref.profile)
    const entry = await this.resumeStored(ref)
    if (entry) return entry
    /*
     * A 4007 here means the key in the URL names nothing on this machine — a
     * stale link, or a session deleted elsewhere. Creating one instead would
     * silently answer a request for a specific conversation with a different,
     * empty one.
     */
    throw new SessionNotFoundError(ref)
  }

  /**
   * `omit_messages` because the transcript arrives through `session.history`,
   * which reads the DB with `include_ancestors` and `include_row_ids` and so
   * answers with strictly more than the resume projection carries.
   *
   * Fails CLOSED on anything that is not 4007: a network blip read as "no
   * session" would strand a live conversation.
   */
  private async resumeStored(ref: ThreadRef): Promise<SessionEntry | null> {
    try {
      const result = await this.gateway.request<SessionResumeResult>('session.resume', {
        session_id: ref.sessionId,
        profile: ref.profile,
        cols: SESSION_COLS,
        omit_messages: true,
      })
      if (!result?.session_id) return null
      return this.remember({ ...ref, liveId: result.session_id })
    } catch (error) {
      if (error instanceof HermesRpcError && error.code === SESSION_ABSENT_CODE) return null
      throw error
    }
  }

  /**
   * The employee's most recent conversation, preferring ones this app started.
   *
   * A profile also accumulates sessions from the TUI, the desktop and its own
   * routines, and dropping the user into a cron run reads as the agent having
   * said things it never said to them.
   */
  async latestSessionId(profile: string): Promise<string | undefined> {
    const listed = await this.gateway.request<SessionListResult>('session.list', {
      profile,
      limit: SESSION_LOOKBACK,
    })
    const rows = listed?.sessions ?? []
    const ordered = [
      ...rows.filter((row) => row.source === SESSION_SOURCE),
      ...rows.filter((row) => row.source !== SESSION_SOURCE),
    ]
    return ordered.map((row) => row.resolved_id || row.id).find(Boolean)
  }

  private remember(entry: SessionEntry): SessionEntry {
    this.byRef.set(refKey(entry), entry)
    this.byLiveId.set(entry.liveId, { profile: entry.profile, sessionId: entry.sessionId })
    return entry
  }

  /**
   * Hermes resolves an unknown profile to `None` and treats that as "use the
   * launch profile" — `_profile_home` wraps every failure path in a bare
   * `except Exception: return None`. Worse, the `info.profile_name` it echoes
   * back always reports the process-global profile, so the client cannot detect
   * the fallback after the fact. Validating up front is the only place this can
   * be caught.
   */
  private async assertProfileExists(profile: string): Promise<void> {
    if (this.knownProfiles == null) {
      this.knownProfiles = await this.profiles.listProfileNames()
    }
    if (!this.knownProfiles.includes(profile)) {
      // Re-check once: the roster may have gained a profile since we cached.
      this.knownProfiles = await this.profiles.listProfileNames()
      if (!this.knownProfiles.includes(profile)) {
        throw new UnknownProfileError(profile, this.knownProfiles)
      }
    }
  }

  /**
   * Answer an open `clarify.request` — the login handoff, among other things.
   *
   * The signature is read off the gateway, not guessed. `tui_gateway/server.py`:
   *
   *     @method("clarify.respond")
   *     def _(rid, params: dict) -> dict:
   *         return _respond(rid, params, "answer", allow_expired=True)
   *
   * and `_respond` reads exactly two params — `params["request_id"]` and, for
   * this method, `params["answer"]`:
   *
   *     r = params.get("request_id", "")
   *     ...
   *     _answers[r] = params.get(key, "")
   *
   * So there is no `session_id` on this call: the request id from the
   * `clarify.request` event is the whole address, and `_pending` is keyed by it
   * alone — which is why an answer still lands after a socket reconnect dropped
   * our session ids. `allow_expired=True` means a late answer resolves as
   * `{status: "expired"}` rather than erroring.
   *
   * No `profile` and no ref: the request id is the whole address.
   */
  async answerClarify(requestId: string, answer: string): Promise<void> {
    await this.gateway.request('clarify.respond', { request_id: requestId, answer })
  }

  /**
   * Hand a captured secret to the skill blocked on an open `secret.request`.
   *
   * Read off the gateway, like `answerClarify` —
   * `tui_gateway/methods_prompt.py`:
   *
   *     @method("secret.respond")
   *     def _(rid, params: dict) -> dict:
   *         return _respond(rid, params, "value", allow_expired=True)
   *
   * so the params are exactly `{request_id, value}`. No `session_id`:
   * `_pending` is keyed by the request id alone, which is why an answer still
   * lands after a socket reconnect dropped our session ids. `allow_expired=True`
   * means a value sent after the agent's wait already ended resolves as
   * `{status: "expired"}` rather than a raw 4009 — that is the race the
   * `secret.expire` event announces.
   *
   * No ref, for the same reason as `answerClarify`: the request id is the
   * whole address.
   *
   * The value is forwarded verbatim and retained nowhere — no store, no log, no
   * error message. Hermes writes it to the profile's env file at 0600
   * (`save_env_value_secure`) and deliberately omits it from the tool result, so
   * the transcript never carries it either.
   */
  async respondSecret(requestId: string, value: string): Promise<void> {
    await this.gateway.request('secret.respond', { request_id: requestId, value })
  }

  /**
   * Decline an open `secret.request` — the card's "Not now".
   *
   * There is no `secret.skip` RPC. The skip signal is this SAME
   * `secret.respond` carrying an EMPTY value, and nothing on the client says so.
   * `_respond` stores whatever `params["value"]` holds (`_answers[r] =
   * params.get(key, "")`) and sets the event, so an empty string releases the
   * parked agent thread at once; the capture callback in `_wire_callbacks`
   * (`tui_gateway/server.py`) then reads that falsy value as a decline:
   *
   *     val = _block("secret.request", sid, pl)
   *     if not val:
   *         return {"success": True, "stored_as": env_var, "validated": False,
   *                 "skipped": True, "message": "skipped"}
   *
   * Nothing is written to the env file and the agent continues without the key.
   * Sending nothing at all is NOT equivalent: the thread stays parked until
   * `_block`'s deadline, which is what a hang looks like to the user.
   */
  async skipSecret(requestId: string): Promise<void> {
    await this.gateway.request('secret.respond', { request_id: requestId, value: '' })
  }

  async submit(ref: ThreadRef, text: string): Promise<PromptSubmitResult> {
    const sessionId = await this.ensureSession(ref)
    return this.gateway.request<PromptSubmitResult>('prompt.submit', {
      session_id: sessionId,
      text,
    })
  }

  async interrupt(ref: ThreadRef): Promise<void> {
    const sessionId = this.liveIdFor(ref)
    if (!sessionId) return
    await this.gateway.request('session.interrupt', { session_id: sessionId })
  }

  async history(ref: ThreadRef): Promise<SessionHistoryResult> {
    const sessionId = await this.ensureSession(ref)
    return this.gateway.request<SessionHistoryResult>('session.history', {
      session_id: sessionId,
    })
  }

  /**
   * Attach a file and get back the `@file:<ref>` token to embed in the next
   * prompt. The attachment is not itself a message — it only exists once the
   * prompt referencing it is submitted.
   */
  async attachFile(ref: ThreadRef, dataUrl: string, name: string): Promise<FileAttachResult> {
    const sessionId = await this.ensureSession(ref)
    return this.gateway.request<FileAttachResult>('file.attach', {
      session_id: sessionId,
      data_url: dataUrl,
      name,
    })
  }
}
