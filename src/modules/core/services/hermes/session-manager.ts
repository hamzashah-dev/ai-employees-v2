import type { HermesGateway } from './gateway'
import type {
  FileAttachResult,
  PromptSubmitResult,
  SessionCreateResult,
  SessionHistoryResult,
  SessionResumeResult,
} from './types'

/**
 * Maps employees (Hermes profiles) onto chat sessions.
 *
 * One session per employee, created lazily and reused. `session.create` binds
 * the profile for the session's whole life — `prompt.submit` has no profile
 * parameter — so getting this wrong once means every later message in that
 * thread goes to the wrong agent.
 */

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

  /** Drop cached sessions. Used after a reconnect, where ids may be stale. */
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

    const creating = this.createSession(profile)
    this.inFlight.set(profile, creating)
    try {
      const entry = await creating
      return entry.sessionId
    } finally {
      this.inFlight.delete(profile)
    }
  }

  private async createSession(profile: string): Promise<SessionEntry> {
    await this.assertProfileExists(profile)

    const result = await this.gateway.request<SessionCreateResult>('session.create', {
      profile,
      cols: 100,
      source: 'employees-ui',
    })

    if (!result?.session_id) {
      throw new Error(`session.create for "${profile}" returned no session_id`)
    }

    const entry: SessionEntry = {
      sessionId: result.session_id,
      profile,
      ...(result.stored_session_id ? { storedSessionId: result.stored_session_id } : {}),
    }
    this.byProfile.set(profile, entry)
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

  async resume(profile: string, sessionId: string): Promise<SessionResumeResult> {
    await this.assertProfileExists(profile)
    const result = await this.gateway.request<SessionResumeResult>('session.resume', {
      session_id: sessionId,
      profile,
      cols: 100,
    })
    this.byProfile.set(profile, { sessionId: result.session_id ?? sessionId, profile })
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
