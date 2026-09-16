import { describe, expect, it, vi } from 'vitest'
import { HermesRpcError } from './gateway'
import { SessionManager, SessionNotFoundError, UnknownProfileError } from './session-manager'
import type { HermesGateway } from './gateway'

/**
 * What this class decides is which conversation a message lands in.
 *
 * An employee holds many sessions at once, so every call is addressed by a
 * `ThreadRef` — profile plus durable key. Two failures matter. Opening a ref
 * must RESUME that exact conversation and never quietly create a different one,
 * because `session.create` mints a fresh key and `session.history` reads by
 * key: a create dressed up as an open shows an empty chat forever while the
 * real transcript sits on disk. And inbound events must route back to the
 * session they came from, not merely to the employee — resolving to the profile
 * alone spliced every session's deltas into whichever thread was on screen.
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
    const answer = handler(params ?? {}, call)
    /*
     * A handler that produces an Error is scripting a REJECTION. Returning it
     * instead would leave `session.resume` answering a malformed success, which
     * this class turns into "nothing to resume" — so a test meaning to exercise
     * the error path would pass without ever entering it.
     */
    if (answer instanceof Error) throw answer
    return answer
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

const REF = { profile: 'ad-creator', sessionId: 'key-1' }

describe('SessionManager', () => {
  it('resumes the conversation named by the ref, and caches it', async () => {
    const { manager, callsTo } = makeManager({
      'session.resume': resolves({ session_id: 'live-1' }),
    })

    expect(await manager.ensureSession(REF)).toBe('live-1')
    expect(await manager.ensureSession(REF)).toBe('live-1')

    // One resume for two opens, and it asked for the key in the ref.
    expect(callsTo('session.resume')).toHaveLength(1)
    expect(callsTo('session.resume')[0]).toMatchObject({
      session_id: 'key-1',
      profile: 'ad-creator',
    })
  })

  it('never creates a session while opening one', async () => {
    // The whole point: a create here would answer a request for a specific
    // conversation with a different, empty one.
    const { manager } = makeManager({ 'session.resume': () => absent() })

    await expect(manager.ensureSession(REF)).rejects.toBeInstanceOf(SessionNotFoundError)
  })

  it('keeps two conversations with one employee apart', async () => {
    const { manager } = makeManager({
      'session.resume': sequence({ session_id: 'live-a' }, { session_id: 'live-b' }),
    })

    const a = await manager.ensureSession({ profile: 'ad-creator', sessionId: 'key-a' })
    const b = await manager.ensureSession({ profile: 'ad-creator', sessionId: 'key-b' })

    expect(a).not.toBe(b)
    expect(manager.refForSession(a)).toEqual({ profile: 'ad-creator', sessionId: 'key-a' })
    expect(manager.refForSession(b)).toEqual({ profile: 'ad-creator', sessionId: 'key-b' })
  })

  it('routes an inbound event to its own session, not just the employee', async () => {
    const { manager } = makeManager({
      'session.resume': sequence({ session_id: 'live-a' }, { session_id: 'live-b' }),
    })
    await manager.ensureSession({ profile: 'ad-creator', sessionId: 'key-a' })
    await manager.ensureSession({ profile: 'ad-creator', sessionId: 'key-b' })

    expect(manager.refForSession('live-b')?.sessionId).toBe('key-b')
    expect(manager.refForSession('never-seen')).toBeUndefined()
  })

  it('dedupes concurrent opens of the same conversation', async () => {
    // Two components mounting the same thread must not both resume it, which
    // would leave two live ids for one conversation.
    const { manager, callsTo } = makeManager({
      'session.resume': resolves({ session_id: 'live-1' }),
    })

    const [a, b] = await Promise.all([manager.ensureSession(REF), manager.ensureSession(REF)])

    expect(a).toBe(b)
    expect(callsTo('session.resume')).toHaveLength(1)
  })

  it('fails closed when a resume errors for any reason but 4007', async () => {
    // A network blip read as "no session" would strand a live conversation.
    const { manager } = makeManager({
      'session.resume': () => new HermesRpcError(5000, 'boom', 'session.resume'),
    })

    await expect(manager.ensureSession(REF)).rejects.toThrow('boom')
  })

  it('creates a session only when asked, and returns its durable key', async () => {
    const { manager, callsTo } = makeManager({
      'session.create': resolves({ session_id: 'live-new', stored_session_id: 'key-new' }),
    })

    expect(await manager.createSession('ad-creator')).toBe('key-new')
    expect(callsTo('session.create')[0]).toMatchObject({ profile: 'ad-creator' })
    // Addressable straight away, without a round trip to resume it.
    expect(manager.liveIdFor({ profile: 'ad-creator', sessionId: 'key-new' })).toBe('live-new')
  })

  it('refuses a created session with no durable key', async () => {
    // Without one there is no address to navigate to, and the session would be
    // reachable only for as long as this socket lives.
    const { manager } = makeManager({ 'session.create': resolves({ session_id: 'live-new' }) })

    await expect(manager.createSession('ad-creator')).rejects.toThrow('stored_session_id')
  })

  it('refuses an employee the backend does not have', async () => {
    // Hermes resolves an unknown profile to the launch profile and echoes back
    // a name that hides the fallback, so this is the only place it is catchable.
    const { manager } = makeManager({ 'session.create': resolves({ session_id: 'x' }) }, ['other'])

    await expect(manager.createSession('ad-creator')).rejects.toBeInstanceOf(UnknownProfileError)
  })

  it('submits into the session the ref names', async () => {
    const { manager, callsTo } = makeManager({
      'session.resume': resolves({ session_id: 'live-1' }),
      'prompt.submit': resolves({ ok: true }),
    })

    await manager.submit(REF, 'hello')

    expect(callsTo('prompt.submit')[0]).toEqual({ session_id: 'live-1', text: 'hello' })
  })

  it('drops live ids on reset but keeps refs openable', async () => {
    // A reconnect invalidates every short-lived id; the durable key does not
    // change, so the open thread re-resumes from the one in its URL.
    const { manager, callsTo } = makeManager({
      'session.resume': sequence({ session_id: 'live-1' }, { session_id: 'live-2' }),
    })

    await manager.ensureSession(REF)
    manager.reset()

    expect(manager.liveIdFor(REF)).toBeUndefined()
    expect(await manager.ensureSession(REF)).toBe('live-2')
    expect(callsTo('session.resume')).toHaveLength(2)
  })

  it('answers a secret request by request id alone', async () => {
    // `_pending` is keyed by request id, which is why an answer still lands
    // after a reconnect dropped every session id.
    const { manager, callsTo } = makeManager({ 'secret.respond': resolves({}) })

    await manager.respondSecret('req-9', 'hunter2')

    expect(callsTo('secret.respond')[0]).toEqual({ request_id: 'req-9', value: 'hunter2' })
  })

  it('declines a secret with an empty value, which is the skip signal', async () => {
    // There is no secret.skip RPC: an empty value releases the parked agent and
    // is read as a decline. Sending nothing at all hangs it until a deadline.
    const { manager, callsTo } = makeManager({ 'secret.respond': resolves({}) })

    await manager.skipSecret('req-9')

    expect(callsTo('secret.respond')[0]).toEqual({ request_id: 'req-9', value: '' })
  })
})
