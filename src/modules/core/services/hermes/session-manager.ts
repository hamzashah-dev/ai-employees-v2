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
 * Maps employees (Hermes profiles) onto chat sessions.
 *
 * One session per employee, created lazily and reused. `session.create` binds
 * the profile for the session's whole life — `prompt.submit` has no profile
 * parameter — so getting this wrong once means every later message in that
 * thread goes to the wrong agent.
 *
 * Opening a session RESUMES the employee's most recent conversation and only
 * creates one when there is nothing to resume. That is what makes a thread
 * survive a reload, and it is not merely cosmetic: `session.create` mints a
 * fresh `stored_session_id` (`_new_session_key()` in `tui_gateway/server.py`)
 * and `session.history` reads the transcript by that key, so a created session
 * is empty by construction and no amount of re-reading history will fill it.
 * Creating on every open also gave the agent a blank context each time, so an
 * employee could not remember what it had just been told.
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

interface SessionEntry {
  sessionId: string
  profile: string
  storedSessionId?: string
}

export class SessionManager {
  private readonly byProfile = new Map<string, SessionEntry>()
  private readonly inFlight = new Map<string, Promise<SessionEntry>>()
  /**
   * The durable key of the conversation each employee is *in*, kept across a
   * `reset()` on purpose. A reconnect must land back in the thread the user was
   * reading, and "newest on disk" is not that thread if one of the employee's
   * routines happened to run while the socket was down.
   */
  private readonly lastStored = new Map<string, string>()
  private knownProfiles: string[] | null = null

  constructor(
    private readonly gateway: HermesGateway,
    private readonly profiles: KnownProfileSource,
  ) {}

  /** Reverse lookup: which employee does an inbound event belong to? */
  profileForSession(sessionId: string): string | undefined {
    for (const entry of this.byProfile.values()) {
      if (entry.sessionId === sessionId) return entry.profile
    }
    return undefined
  }

  sessionIdFor(profile: string): string | undefined {
    return this.byProfile.get(profile)?.sessionId
  }

  /**
   * Drop cached sessions. Used after a reconnect, where the short-lived
   * `session_id`s are stale. `lastStored` survives: the durable keys are still
   * valid, and they are how the next open reattaches instead of forking.
   */
  reset(): void {
    this.byProfile.clear()
    this.inFlight.clear()
  }

  invalidateProfileCache(): void {
    this.knownProfiles = null
  }

  async ensureSession(profile: string): Promise<string> {
    const existing = this.byProfile.get(profile)
    if (existing) return existing.sessionId

    const pending = this.inFlight.get(profile)
    if (pending) return (await pending).sessionId

    const opening = this.openSession(profile)
    this.inFlight.set(profile, opening)
    try {
      const entry = await opening
      return entry.sessionId
    } finally {
      this.inFlight.delete(profile)
    }
  }

  /** Reattach to this employee's last conversation, or start their first. */
  private async openSession(profile: string): Promise<SessionEntry> {
    await this.assertProfileExists(profile)
    return (await this.resumeLatest(profile)) ?? (await this.createSession(profile))
  }

  /**
   * Reattach to this employee's conversation: the one they were last in, else
   * the newest one on disk. Null means there is genuinely nothing to resume.
   *
   * Fails CLOSED on anything that is not 4007. A network blip read as "no
   * session" would mint a second session for an employee that already has one,
   * forking the thread and orphaning everything said in it — the same reasoning
   * `ensureGroupSession` documents for rooms. The caller surfaces the error;
   * `chat-store` puts it on the thread or on the unsent message.
   */
  private async resumeLatest(profile: string): Promise<SessionEntry | null> {
    for (const target of await this.resumeCandidates(profile)) {
      const entry = await this.resumeStored(profile, target)
      if (entry) return entry
    }
    return null
  }

  /**
   * Durable keys to try, best first, deduped.
   *
   * The listing is skipped entirely when we already know where this employee
   * was — the common reconnect case, and one fewer round trip on it.
   */
  private async resumeCandidates(profile: string): Promise<string[]> {
    const remembered = this.lastStored.get(profile)
    if (remembered) return [remembered]

    const listed = await this.gateway.request<SessionListResult>('session.list', {
      profile,
      limit: SESSION_LOOKBACK,
    })
    const rows = listed?.sessions ?? []
    // Ours first, then anything: a profile also accumulates sessions from the
    // TUI, the desktop and its own routines, and splicing a cron run into the
    // user's chat is worse than starting one row lower down the list.
    const ordered = [
      ...rows.filter((row) => row.source === SESSION_SOURCE),
      ...rows.filter((row) => row.source !== SESSION_SOURCE),
    ]
    return [...new Set(ordered.map((row) => row.resolved_id || row.id).filter(Boolean))]
  }

  /**
   * `omit_messages` because the transcript arrives through `session.history`,
   * which reads the DB with `include_ancestors` and `include_row_ids` and so
   * answers with strictly more than the resume projection carries.
   */
  private async resumeStored(profile: string, target: string): Promise<SessionEntry | null> {
    try {
      const result = await this.gateway.request<SessionResumeResult>('session.resume', {
        session_id: target,
        profile,
        cols: SESSION_COLS,
        omit_messages: true,
      })
      if (!result?.session_id) return null
      // A resume answers `stored_session_id: null` — it reports the durable key
      // as `session_key` and `resumed` instead. The key we asked with is that
      // key, so keep it rather than losing the address on the next reconnect.
      return this.remember({
        sessionId: result.session_id,
        profile,
        storedSessionId: result.stored_session_id || target,
      })
    } catch (error) {
      if (error instanceof HermesRpcError && error.code === SESSION_ABSENT_CODE) return null
      throw error
    }
  }

  private remember(entry: SessionEntry): SessionEntry {
    this.byProfile.set(entry.profile, entry)
    if (entry.storedSessionId) this.lastStored.set(entry.profile, entry.storedSessionId)
    return entry
  }

  private async createSession(profile: string): Promise<SessionEntry> {
    const result = await this.gateway.request<SessionCreateResult>('session.create', {
      profile,
      cols: SESSION_COLS,
      source: SESSION_SOURCE,
    })

    if (!result?.session_id) {
      throw new Error(`session.create for "${profile}" returned no session_id`)
    }

    return this.remember({
      sessionId: result.session_id,
      profile,
      ...(result.stored_session_id ? { storedSessionId: result.stored_session_id } : {}),
    })
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

  /** Reattach to one named conversation — a picker's entry point. */
  async resume(profile: string, sessionId: string): Promise<SessionResumeResult> {
    await this.assertProfileExists(profile)
    const result = await this.gateway.request<SessionResumeResult>('session.resume', {
      session_id: sessionId,
      profile,
      cols: SESSION_COLS,
    })
    this.remember({
      sessionId: result.session_id ?? sessionId,
      profile,
      storedSessionId: result.stored_session_id || sessionId,
    })
    return result
  }

  async submit(profile: string, text: string): Promise<PromptSubmitResult> {
    const sessionId = await this.ensureSession(profile)
    return this.gateway.request<PromptSubmitResult>('prompt.submit', {
      session_id: sessionId,
      text,
    })
  }

  async interrupt(profile: string): Promise<void> {
    const sessionId = this.byProfile.get(profile)?.sessionId
    if (!sessionId) return
    await this.gateway.request('session.interrupt', { session_id: sessionId })
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
   * `profile` is not sent; it is taken so callers address employees the same way
   * they do everywhere else in this class, and so a future session-scoped
   * variant of the RPC needs no signature change at the call sites.
   */
  async answerClarify(profile: string, requestId: string, answer: string): Promise<void> {
    void profile
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
   * `profile` is not sent, for the same reason it is not sent on
   * `answerClarify`: callers address employees the same way they do everywhere
   * else in this class.
   *
   * The value is forwarded verbatim and retained nowhere — no store, no log, no
   * error message. Hermes writes it to the profile's env file at 0600
   * (`save_env_value_secure`) and deliberately omits it from the tool result, so
   * the transcript never carries it either.
   */
  async respondSecret(profile: string, requestId: string, value: string): Promise<void> {
    void profile
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
  async skipSecret(profile: string, requestId: string): Promise<void> {
    void profile
    await this.gateway.request('secret.respond', { request_id: requestId, value: '' })
  }

  async history(profile: string): Promise<SessionHistoryResult> {
    const sessionId = await this.ensureSession(profile)
    return this.gateway.request<SessionHistoryResult>('session.history', {
      session_id: sessionId,
    })
  }

  /**
   * Attach a file and get back the `@file:<ref>` token to embed in the next
   * prompt. The attachment is not itself a message — it only exists once the
   * prompt referencing it is submitted.
   */
  async attachFile(profile: string, dataUrl: string, name: string): Promise<FileAttachResult> {
    const sessionId = await this.ensureSession(profile)
    return this.gateway.request<FileAttachResult>('file.attach', {
      session_id: sessionId,
      data_url: dataUrl,
      name,
    })
  }
}
