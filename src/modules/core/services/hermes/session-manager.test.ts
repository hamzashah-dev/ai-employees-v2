import { describe, expect, it, vi } from 'vitest'
import { HermesRpcError } from './gateway'
import { SessionManager, UnknownProfileError } from './session-manager'
import type { HermesGateway } from './gateway'

/**
 * What this class decides is whether an employee's thread SURVIVES.
 *
 * `session.create` mints a fresh durable key and `session.history` reads the
 * transcript by that key, so a manager that creates on every open shows an
 * empty chat forever and hands the agent a blank context — the bug these tests
 * exist to keep fixed. The mirror-image failure is just as bad: resuming
 * something that is not this app's chat, or minting a second session for an
 * employee that already has one, forks the thread.
 */

type Handler = (params: Record<string, unknown>, call: number) => unknown

/**
 * Script the socket per method. An unscripted method is an error rather than a
 * silent `undefined`, so a call nobody expected fails loudly.
 */
function makeManager(
  handlers: Record<string, Handler | undefined>,
  known: string[] = ['ad-creator'],
) {
  const seen = new Map<string, number>()
  const request = vi.fn(async (method: string, params?: Record<string, unknown>) => {
    const call = seen.get(method) ?? 0
    seen.set(method, call + 1)
    const handler = handlers[method]
    if (!handler) throw new Error(`unscripted gateway call: ${method}`)
    return handler(params ?? {}, call)
  })
  const gateway = { request } as unknown as HermesGateway
  const listProfileNames = vi.fn().mockResolvedValue(known)
  const manager = new SessionManager(gateway, { listProfileNames })

  const callsTo = (method: string) =>
    request.mock.calls.filter(([m]) => m === method).map(([, params]) => params)

  return { manager, request, listProfileNames, callsTo }
}

const resolves =
  (value: unknown): Handler =>
  () =>
    value

/** Steps answers in order; the last repeats for every further call. */
const sequence =
  (...steps: unknown[]): Handler =>
  (_params, call) =>
    steps[Math.min(call, steps.length - 1)]

const absent = () => new HermesRpcError(4007, 'session not found', 'session.resume')

const NOTHING_TO_RESUME = { 'session.list': resolves({ sessions: [] }) }

describe('SessionManager', () => {
  it('creates a session bound to the requested profile when there is nothing to resume', async () => {
    const { manager, callsTo } = makeManager({
      ...NOTHING_TO_RESUME,
      'session.create': resolves({ session_id: 'sess-1' }),
    })

    await expect(manager.ensureSession('ad-creator')).resolves.toBe('sess-1')
    expect(callsTo('session.create')).toEqual([
      expect.objectContaining({ profile: 'ad-creator', source: 'employees-ui' }),
    ])
  })

  /**
   * The regression test. A reload used to land here and get a blank thread.
   */
  it('resumes the employee’s newest conversation instead of creating a new one', async () => {
    const { manager, callsTo } = makeManager({
      'session.list': resolves({
        sessions: [{ id: '20260831_101319_9174a3', source: 'employees-ui', message_count: 63 }],
      }),
      'session.resume': resolves({ session_id: 'live-1' }),
    })

    await expect(manager.ensureSession('ad-creator')).resolves.toBe('live-1')
    expect(callsTo('session.resume')).toEqual([
      {
        session_id: '20260831_101319_9174a3',
        profile: 'ad-creator',
        cols: 100,
        omit_messages: true,
      },
    ])
    expect(callsTo('session.create')).toEqual([])
  })

  it('lists per profile, because sessions live in that profile’s own state.db', async () => {
    const { manager, callsTo } = makeManager({
      ...NOTHING_TO_RESUME,
      'session.create': resolves({ session_id: 'sess-1' }),
    })

    await manager.ensureSession('ad-creator')

    expect(callsTo('session.list')).toEqual([{ profile: 'ad-creator', limit: 20 }])
  })

  /**
   * A profile accumulates sessions from the TUI, the desktop and its own
   * routines. Resuming a cron run as if it were the user's chat would splice
   * unrelated turns into the thread, so our own source wins even when it is
   * older.
   */
  it('prefers this app’s own session over a newer one from another surface', async () => {
    const { manager, callsTo } = makeManager({
      'session.list': resolves({
        sessions: [
          { id: 'cron-newest', source: 'cron' },
          { id: 'ours-older', source: 'employees-ui' },
        ],
      }),
      'session.resume': resolves({ session_id: 'live-1' }),
    })

    await manager.ensureSession('ad-creator')

    expect(callsTo('session.resume')[0]).toMatchObject({ session_id: 'ours-older' })
  })

  it('follows resolved_id to a compression lineage’s live tip', async () => {
    const { manager, callsTo } = makeManager({
      'session.list': resolves({
        sessions: [{ id: 'ancestor', resolved_id: 'live-tip', source: 'employees-ui' }],
      }),
      'session.resume': resolves({ session_id: 'live-1' }),
    })

    await manager.ensureSession('ad-creator')

    expect(callsTo('session.resume')[0]).toMatchObject({ session_id: 'live-tip' })
  })

  it('tries the next candidate when a listed session has gone, then creates', async () => {
    const { manager, callsTo } = makeManager({
      'session.list': resolves({
        sessions: [
          { id: 'deleted', source: 'employees-ui' },
          { id: 'also-deleted', source: 'employees-ui' },
        ],
      }),
      'session.resume': () => {
        throw absent()
      },
      'session.create': resolves({ session_id: 'sess-new' }),
    })

    await expect(manager.ensureSession('ad-creator')).resolves.toBe('sess-new')
    expect(callsTo('session.resume').map((params) => params?.session_id)).toEqual([
      'deleted',
      'also-deleted',
    ])
  })

  /**
   * Fails CLOSED. A network blip read as "no session" would mint a second
   * session for an employee that already has one, forking the thread and
   * orphaning everything said in it.
   */
  it('refuses to create a second session when resume fails for any reason but 4007', async () => {
    const { manager, callsTo } = makeManager({
      'session.list': resolves({ sessions: [{ id: 'real', source: 'employees-ui' }] }),
      'session.resume': () => {
        throw new HermesRpcError(5000, 'db unavailable', 'session.resume')
      },
      'session.create': resolves({ session_id: 'must-not-happen' }),
    })

    await expect(manager.ensureSession('ad-creator')).rejects.toThrow(/db unavailable/)
    expect(callsTo('session.create')).toEqual([])
  })

  it('reuses the session for an employee rather than opening a second', async () => {
    const { manager, callsTo } = makeManager({
      ...NOTHING_TO_RESUME,
      'session.create': resolves({ session_id: 'sess-1' }),
    })

    const a = await manager.ensureSession('ad-creator')
    const b = await manager.ensureSession('ad-creator')

    expect(a).toBe(b)
    expect(callsTo('session.create')).toHaveLength(1)
  })

  it('opens only one session when concurrent callers race', async () => {
    const { manager, callsTo } = makeManager({
      ...NOTHING_TO_RESUME,
      'session.create': resolves({ session_id: 'sess-1' }),
    })

    const [a, b] = await Promise.all([
      manager.ensureSession('ad-creator'),
      manager.ensureSession('ad-creator'),
    ])

    expect(a).toBe(b)
    expect(callsTo('session.create')).toHaveLength(1)
  })

  /**
   * A reconnect invalidates the short-lived ids, not the durable key. Landing
   * back in the same conversation is the whole point of keeping it.
   */
  it('reattaches to the same conversation after a reconnect, without re-listing', async () => {
    const { manager, callsTo } = makeManager({
      ...NOTHING_TO_RESUME,
      'session.create': resolves({ session_id: 'sess-1', stored_session_id: 'stored-1' }),
      'session.resume': resolves({ session_id: 'sess-2' }),
    })

    await manager.ensureSession('ad-creator')
    manager.reset()

    await expect(manager.ensureSession('ad-creator')).resolves.toBe('sess-2')
    expect(callsTo('session.resume')[0]).toMatchObject({ session_id: 'stored-1' })
    expect(callsTo('session.list')).toHaveLength(1)
    expect(callsTo('session.create')).toHaveLength(1)
  })

  /**
   * `session.resume` answers `stored_session_id: null` and echoes the key it
   * matched in `resumed` instead, so the durable address has to be carried
   * forward by the caller or the next reconnect loses the thread.
   */
  it('keeps the durable key a resume does not echo back', async () => {
    const { manager, callsTo } = makeManager({
      'session.list': resolves({ sessions: [{ id: 'stored-1', source: 'employees-ui' }] }),
      'session.resume': sequence(
        { session_id: 'live-1', stored_session_id: null, resumed: 'stored-1' },
        { session_id: 'live-2' },
      ),
    })

    await manager.ensureSession('ad-creator')
    manager.reset()
    await manager.ensureSession('ad-creator')

    expect(callsTo('session.resume').map((params) => params?.session_id)).toEqual([
      'stored-1',
      'stored-1',
    ])
  })

  /**
   * The load-bearing test. Hermes resolves an unknown profile to the launch
   * profile instead of erroring, and echoes back a profile_name that is always
   * the process-global one — so a typo silently routes a marketing brief to the
   * generic agent, undetectably. Refusing up front is the only defence.
   */
  it('refuses to open a session for an unknown employee', async () => {
    const { manager, request } = makeManager({}, ['ad-creator'])

    await expect(manager.ensureSession('ad-cretor')).rejects.toBeInstanceOf(UnknownProfileError)
    expect(request).not.toHaveBeenCalled()
  })

  it('re-checks the roster once before rejecting, so a new hire works', async () => {
    const listProfileNames = vi
      .fn()
      .mockResolvedValueOnce(['ad-creator'])
      .mockResolvedValueOnce(['ad-creator', 'talent-scout'])
    const request = vi.fn(async (method: string) => {
      if (method === 'session.list') return { sessions: [] }
      if (method === 'session.create') return { session_id: 'sess-2' }
      throw new Error(`unscripted gateway call: ${method}`)
    })
    const manager = new SessionManager({ request } as unknown as HermesGateway, {
      listProfileNames,
    })

    await expect(manager.ensureSession('talent-scout')).resolves.toBe('sess-2')
    expect(listProfileNames).toHaveBeenCalledTimes(2)
  })

  it('maps a session id back to its employee', async () => {
    const { manager } = makeManager({
      ...NOTHING_TO_RESUME,
      'session.create': resolves({ session_id: 'sess-1' }),
    })
    await manager.ensureSession('ad-creator')

    expect(manager.profileForSession('sess-1')).toBe('ad-creator')
    expect(manager.profileForSession('other')).toBeUndefined()
  })

  it('sends prompts to the session bound to that employee', async () => {
    const { manager, request } = makeManager({
      'session.list': resolves({ sessions: [{ id: 'stored-1', source: 'employees-ui' }] }),
      'session.resume': resolves({ session_id: 'sess-a' }),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    await manager.submit('ad-creator', 'hello')

    expect(request).toHaveBeenLastCalledWith('prompt.submit', {
      session_id: 'sess-a',
      text: 'hello',
    })
  })

  it('reads history from the session it resumed', async () => {
    const { manager, request } = makeManager({
      'session.list': resolves({ sessions: [{ id: 'stored-1', source: 'employees-ui' }] }),
      'session.resume': resolves({ session_id: 'sess-a' }),
      'session.history': resolves({ count: 2, messages: [{ role: 'user', text: 'hi' }] }),
    })

    await expect(manager.history('ad-creator')).resolves.toMatchObject({ count: 2 })
    expect(request).toHaveBeenLastCalledWith('session.history', { session_id: 'sess-a' })
  })

  it('does nothing when interrupting an employee with no session', async () => {
    const { manager, request } = makeManager({})
    await manager.interrupt('ad-creator')
    expect(request).not.toHaveBeenCalled()
  })

  it('answers a clarify by request id alone, with no session id', async () => {
    // `clarify.respond` -> `_respond(rid, params, "answer")` reads only
    // `params["request_id"]` and `params["answer"]`; `_pending` is keyed by the
    // request id, so no session has to exist for the answer to land.
    const { manager, request } = makeManager({ 'clarify.respond': resolves({}) })

    await manager.answerClarify('ad-creator', 'c1', 'logged in')

    expect(request).toHaveBeenCalledWith('clarify.respond', {
      request_id: 'c1',
      answer: 'logged in',
    })
  })

  it('sends a captured secret by request id alone, with no session id', async () => {
    // `secret.respond` -> `_respond(rid, params, "value")` reads only
    // `params["request_id"]` and `params["value"]`, and `_pending` is keyed by
    // the request id, so the value lands even after a reconnect lost our
    // session ids. An unscripted method throws, so this also proves no session
    // is opened on the way.
    const { manager, request } = makeManager({ 'secret.respond': resolves({ status: 'ok' }) })

    await manager.respondSecret('ad-creator', 's1', 'super-secret')

    expect(request).toHaveBeenCalledWith('secret.respond', {
      request_id: 's1',
      value: 'super-secret',
    })
    expect(request).toHaveBeenCalledTimes(1)
  })

  /**
   * A key is opaque. Trimming, re-casing or collapsing whitespace would write a
   * subtly wrong value into the env file and fail at first use, far away from
   * here and with nothing in the transcript to look at.
   */
  it('passes the secret value through untouched', async () => {
    const { manager, request } = makeManager({ 'secret.respond': resolves({ status: 'ok' }) })
    const value = '  -----BEGIN KEY-----\n aB+/=\t '

    await manager.respondSecret('ad-creator', 's1', value)

    expect(request).toHaveBeenCalledWith('secret.respond', { request_id: 's1', value })
  })

  /**
   * "Not now" is the same RPC with an empty value: `if not val` in the capture
   * callback returns `{skipped: true}`, nothing is written to the env file and
   * the agent continues without the key. Sending nothing instead leaves the
   * agent thread parked until `_block`'s deadline — a hang.
   */
  it('skips a secret request with an empty value on the same method', async () => {
    const { manager, request } = makeManager({ 'secret.respond': resolves({ status: 'ok' }) })

    await manager.skipSecret('ad-creator', 's1')

    expect(request).toHaveBeenCalledWith('secret.respond', { request_id: 's1', value: '' })
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('throws when the server returns no session id', async () => {
    const { manager } = makeManager({
      ...NOTHING_TO_RESUME,
      'session.create': resolves({}),
    })

    await expect(manager.ensureSession('ad-creator')).rejects.toThrow(/no session_id/)
  })
})
