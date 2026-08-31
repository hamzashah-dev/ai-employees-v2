import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HermesRpcError } from '@/modules/core/services/hermes/gateway'
import type { HermesWireMessage } from '@/modules/core/services/hermes/types'
import { GROUP_TURN_POLL_MS, GROUP_TURN_TIMEOUT_MS } from '@/modules/core/constants/groups'
import type { GroupTurnRequest } from './index'

/**
 * The room engine's contract with the gateway, run against a scripted socket.
 *
 * These functions are the only place that decides whether a member gets a
 * *second* session (forking its history), whether a slow turn is lost or
 * harvested, and whether a model's real answer stays hidden behind the
 * "(pass)" it emitted afterwards. A typecheck sees none of that.
 */

const { request } = vi.hoisted(() => ({
  request:
    vi.fn<(method: string, params?: Record<string, unknown>) => Promise<unknown>>(),
}))

vi.mock('@/modules/core/hooks/use-hermes', () => ({
  getHermes: () => ({ gateway: { request }, sessions: {} }),
}))

const {
  ensureGroupSession,
  groupSessionTitle,
  harvestGroupTurn,
  interruptGroupMember,
  pickGroupTurnReply,
  runGroupTurn,
} = await import('./index')

// --------------------------------------------------------------- scripting

type RequestHandler = (params: Record<string, unknown>, call: number) => unknown

/**
 * Script the socket per method. A method a test did not script is an error
 * rather than a silent `undefined`: a turn that quietly polls something nobody
 * expected should fail loudly instead of passing on a stub.
 */
function script(handlers: Record<string, RequestHandler>): void {
  const seen = new Map<string, number>()
  request.mockImplementation(async (method, params) => {
    const call = seen.get(method) ?? 0
    seen.set(method, call + 1)
    const handler = handlers[method]
    if (!handler) throw new Error(`unscripted gateway call: ${method}`)
    return handler(params ?? {}, call)
  })
}

/** Steps answer calls in order; the last one repeats for every further call. */
function sequence(...steps: Array<() => unknown>): RequestHandler {
  return (_params, call) => {
    const step = steps[Math.min(call, steps.length - 1)]
    if (!step) throw new Error('empty sequence')
    return step()
  }
}

const resolves =
  (value: unknown) =>
  (): unknown =>
    value

const rejects = (error: unknown) => (): unknown => {
  throw error
}

const absent = (): HermesRpcError =>
  new HermesRpcError(4007, 'session not found', 'session.resume')

function callsTo(method: string): Array<Record<string, unknown> | undefined> {
  return request.mock.calls.filter(([m]) => m === method).map(([, params]) => params)
}

function assistant(text: string): HermesWireMessage {
  return { role: 'assistant', content: text }
}

function user(text: string): HermesWireMessage {
  return { role: 'user', content: text }
}

/** One poll interval of the turn loop, microtasks flushed. */
async function poll(): Promise<void> {
  await vi.advanceTimersByTimeAsync(GROUP_TURN_POLL_MS)
}

const turn: GroupTurnRequest = {
  member: 'ad-creator',
  prompt: 'Room: what ships this week?',
  roomId: 'room-42',
  // Deliberately different values: `prompt.submit` must use the short id and
  // every `session.resume` must use the durable one. A test that reused one
  // string for both would pass while the poll 4007s in production.
  sessionId: 'sess-1',
  storedId: 'stored-1',
  before: 0,
}

beforeEach(() => {
  request.mockReset()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ------------------------------------------------------------------- title

describe('groupSessionTitle', () => {
  it('titles the session from the room id, never the display name', () => {
    expect(groupSessionTitle('room-42')).toBe('Group: room-42')
  })
})

// ---------------------------------------------------------------- the pick

describe('pickGroupTurnReply', () => {
  it('prefers the last substantive answer over the pass that trails it', () => {
    const messages = [
      user('what ships?'),
      assistant('The beta ships Friday.'),
      assistant('(pass)'),
    ]

    expect(pickGroupTurnReply(messages, 0)).toBe('The beta ships Friday.')
  })

  it('reaches past several trailing passes to the real answer', () => {
    const messages = [
      assistant('Two engineers, one week.'),
      assistant('pass'),
      assistant('(pass).'),
    ]

    expect(pickGroupTurnReply(messages, 0)).toBe('Two engineers, one week.')
  })

  it('returns the pass when nothing else is in range', () => {
    expect(pickGroupTurnReply([assistant('(pass)')], 0)).toBe('(pass)')
  })

  it('keeps the newest pass when every message in range is one', () => {
    const messages = [assistant('pass'), assistant('(PASS)')]

    expect(pickGroupTurnReply(messages, 0)).toBe('(PASS)')
  })

  it('ignores every role but assistant', () => {
    const messages = [
      assistant('(pass)'),
      user('somebody answer this'),
      { role: 'system', content: 'you are in a room' },
      { role: 'tool', content: 'ran list_skills' },
    ]

    expect(pickGroupTurnReply(messages, 0)).toBe('(pass)')
  })

  it('returns null when the only messages in range are not the assistant', () => {
    expect(pickGroupTurnReply([user('hello?')], 0)).toBeNull()
  })

  it('reads content as a plain string', () => {
    expect(pickGroupTurnReply([{ role: 'assistant', content: 'Plain string.' }], 0)).toBe(
      'Plain string.',
    )
  })

  it('reads content as a part array, joining text parts and skipping the rest', () => {
    const messages: HermesWireMessage[] = [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Half ' },
          'and half',
          { type: 'image', url: 'x' },
          { type: 'text', text: 42 },
          null,
        ],
      },
    ]

    expect(pickGroupTurnReply(messages, 0)).toBe('Half and half')
  })

  it('reads the flat text field', () => {
    expect(pickGroupTurnReply([{ role: 'assistant', text: 'From text.' }], 0)).toBe(
      'From text.',
    )
  })

  it('prefers text over content when a message carries both', () => {
    const messages: HermesWireMessage[] = [
      { role: 'assistant', text: 'winner', content: 'loser' },
    ]

    expect(pickGroupTurnReply(messages, 0)).toBe('winner')
  })

  it('trims the reply it hands back', () => {
    expect(pickGroupTurnReply([assistant('  Ready.  \n')], 0)).toBe('Ready.')
  })

  it('skips a message whose content is a shape it cannot read', () => {
    const messages: HermesWireMessage[] = [
      assistant('Readable.'),
      { role: 'assistant', content: 42 },
    ]

    expect(pickGroupTurnReply(messages, 0)).toBe('Readable.')
  })

  /**
   * An empty assistant row is skipped rather than counted as a pass, so a turn
   * that produced nothing at all reports null instead of a stray "(pass)".
   */
  it('skips empty and whitespace-only assistant messages', () => {
    expect(pickGroupTurnReply([assistant('Answered.'), assistant('   \n')], 0)).toBe(
      'Answered.',
    )
    expect(pickGroupTurnReply([assistant('   ')], 0)).toBeNull()
  })

  it('reads only from before onwards, so an older answer is not replayed', () => {
    const messages = [assistant('Last round.'), assistant('This round.')]

    expect(pickGroupTurnReply(messages, 1)).toBe('This round.')
  })

  it('returns null when no assistant message exists after before', () => {
    const messages = [assistant('Last round.'), user('anyone?')]

    expect(pickGroupTurnReply(messages, 1)).toBeNull()
    expect(pickGroupTurnReply(messages, 2)).toBeNull()
    expect(pickGroupTurnReply(messages, 99)).toBeNull()
  })

  it('returns null for an empty log', () => {
    expect(pickGroupTurnReply([], 0)).toBeNull()
  })
})

// ------------------------------------------------------------- the session

describe('ensureGroupSession', () => {
  it('resumes the durable id it already knows, and asks nothing else', async () => {
    script({
      'session.resume': resolves({
        session_id: 'sess-live',
        stored_session_id: 'stored-1',
      }),
    })

    await expect(
      ensureGroupSession('room-42', 'ad-creator', 'stored-1'),
    ).resolves.toMatchObject({ sessionId: 'sess-live', storedId: 'stored-1' })
    expect(request).toHaveBeenCalledWith('session.resume', {
      session_id: 'stored-1',
      profile: 'ad-creator',
      cols: 100,
      omit_messages: true,
    })
    expect(callsTo('session.list')).toHaveLength(0)
    expect(callsTo('session.create')).toHaveLength(0)
  })

  it('keeps the key it resumed on when the wire echoes no stored id', async () => {
    script({ 'session.resume': resolves({ session_id: 'sess-live' }) })

    await expect(
      ensureGroupSession('room-42', 'ad-creator', 'stored-1'),
    ).resolves.toMatchObject({ sessionId: 'sess-live', storedId: 'stored-1' })
  })

  it('finds the room session by title when no id is known', async () => {
    script({
      'session.list': resolves({
        sessions: [{ id: 'stored-1', resolved_id: 'stored-1-tip', title: 'Group: room-42' }],
      }),
      'session.resume': resolves({
        session_id: 'sess-live',
        stored_session_id: 'stored-1-tip',
      }),
    })

    await expect(ensureGroupSession('room-42', 'ad-creator')).resolves.toMatchObject({
      sessionId: 'sess-live',
      storedId: 'stored-1-tip',
    })
    expect(request).toHaveBeenCalledWith('session.list', {
      title: 'Group: room-42',
      profile: 'ad-creator',
    })
    // The tip of the compression lineage wins over the row's own id.
    expect(callsTo('session.resume')[0]).toEqual({
      session_id: 'stored-1-tip',
      profile: 'ad-creator',
      cols: 100,
      omit_messages: true,
    })
    expect(callsTo('session.create')).toHaveLength(0)
  })

  it('falls back to the listed row id when it has no resolved id', async () => {
    script({
      'session.list': resolves({ sessions: [{ id: 'stored-1' }] }),
      'session.resume': resolves({ session_id: 'sess-live' }),
    })

    await expect(ensureGroupSession('room-42', 'ad-creator')).resolves.toMatchObject({
      sessionId: 'sess-live',
      storedId: 'stored-1',
    })
  })

  it('looks the title up when the known id is gone', async () => {
    script({
      'session.resume': sequence(
        rejects(absent()),
        resolves({ session_id: 'sess-live', stored_session_id: 'stored-2' }),
      ),
      'session.list': resolves({ sessions: [{ id: 'stored-2' }] }),
    })

    await expect(
      ensureGroupSession('room-42', 'ad-creator', 'stored-stale'),
    ).resolves.toMatchObject({ sessionId: 'sess-live', storedId: 'stored-2' })
    expect(callsTo('session.create')).toHaveLength(0)
  })

  it('looks the title up when a resume answers without a session id', async () => {
    script({
      'session.resume': sequence(resolves({}), resolves({ session_id: 'sess-live' })),
      'session.list': resolves({ sessions: [{ id: 'stored-2' }] }),
    })

    await expect(
      ensureGroupSession('room-42', 'ad-creator', 'stored-stale'),
    ).resolves.toMatchObject({ sessionId: 'sess-live', storedId: 'stored-2' })
    expect(callsTo('session.create')).toHaveLength(0)
  })

  it('creates a room session only once both lookups come up empty', async () => {
    script({
      'session.resume': rejects(absent()),
      'session.list': resolves({ sessions: [] }),
      'session.create': resolves({
        session_id: 'sess-new',
        stored_session_id: 'stored-new',
      }),
    })

    await expect(
      ensureGroupSession('room-42', 'ad-creator', 'stored-stale'),
    ).resolves.toMatchObject({ sessionId: 'sess-new', storedId: 'stored-new' })
    expect(request).toHaveBeenCalledWith('session.create', {
      profile: 'ad-creator',
      title: 'Group: room-42',
      cols: 100,
      source: 'employees-ui',
      hidden: true,
      room_plumbing: true,
    })
  })

  it('creates when the title lookup itself reports nothing to resume', async () => {
    script({
      'session.list': rejects(absent()),
      'session.create': resolves({ session_id: 'sess-new' }),
    })

    await expect(ensureGroupSession('room-42', 'ad-creator')).resolves.toMatchObject({
      sessionId: 'sess-new',
      storedId: 'sess-new',
    })
  })

  /**
   * The whole point of the function. A blip read as "no session" mints a second
   * session for the same member and room, forking its history and orphaning
   * everything it had already said — so anything that is not 4007 propagates
   * and nothing is created.
   */
  it('fails closed on a timeout rather than minting a second session', async () => {
    script({
      'session.resume': rejects(new Error('session.resume timed out after 60000ms')),
    })

    await expect(
      ensureGroupSession('room-42', 'ad-creator', 'stored-1'),
    ).rejects.toThrow(/timed out/)
    expect(callsTo('session.list')).toHaveLength(0)
    expect(callsTo('session.create')).toHaveLength(0)
  })

  it('fails closed when the title lookup errors for any other reason', async () => {
    script({
      'session.resume': rejects(absent()),
      'session.list': rejects(new HermesRpcError(5000, 'internal error', 'session.list')),
    })

    await expect(
      ensureGroupSession('room-42', 'ad-creator', 'stored-stale'),
    ).rejects.toBeInstanceOf(HermesRpcError)
    expect(callsTo('session.create')).toHaveLength(0)
  })

  it('fails closed when resuming the listed row errors for any other reason', async () => {
    script({
      'session.list': resolves({ sessions: [{ id: 'stored-1' }] }),
      'session.resume': rejects(new HermesRpcError(5000, 'internal error', 'session.resume')),
    })

    await expect(ensureGroupSession('room-42', 'ad-creator')).rejects.toBeInstanceOf(
      HermesRpcError,
    )
    expect(callsTo('session.create')).toHaveLength(0)
  })

  it('refuses a create that came back without a session id', async () => {
    script({
      'session.list': resolves({ sessions: [] }),
      'session.create': resolves({ stored_session_id: 'stored-new' }),
    })

    await expect(ensureGroupSession('room-42', 'ad-creator')).rejects.toThrow(
      /ad-creator.*no session_id/,
    )
  })

  it('refuses a create whose session id is empty', async () => {
    script({
      'session.list': resolves({ sessions: [] }),
      'session.create': resolves({ session_id: '' }),
    })

    await expect(ensureGroupSession('room-42', 'ad-creator')).rejects.toThrow(
      /no session_id/,
    )
  })
})

// ---------------------------------------------------------------- the turn

describe('runGroupTurn', () => {
  it('submits the prompt, then polls until the member stops working', async () => {
    script({
      'session.resume': sequence(
        resolves({ messages: [user('kick off')] }),
        resolves({ running: true, messages: [user('kick off')] }),
        resolves({
          running: false,
          messages: [user('kick off'), assistant('The beta ships Friday.')],
        }),
      ),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => true)
    await poll()
    await poll()

    await expect(promise).resolves.toMatchObject({
      status: 'replied',
      reply: 'The beta ships Friday.',
    })
    expect(request).toHaveBeenCalledWith('prompt.submit', {
      session_id: 'sess-1',
      text: 'Room: what ships this week?',
    })
    expect(callsTo('session.resume')[1]).toEqual({
      // The durable key, not `sess-1`: resume matches on stored_session_id, and
      // polling with the short id 4007s while the member is genuinely working.
      session_id: 'stored-1',
      profile: 'ad-creator',
      cols: 100,
    })
  })

  /**
   * The pre-read is what stops last round's answer being posted again: with the
   * window pinned to the log length at dispatch, a member that only passes this
   * round reports silence rather than repeating itself.
   */
  it('pins the reply window with a pre-read of the session', async () => {
    const history = [user('last round'), assistant('Answer from last round.')]
    script({
      'session.resume': sequence(
        resolves({ messages: history }),
        resolves({ running: false, messages: [...history, assistant('(pass)')] }),
      ),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => true)
    await poll()

    await expect(promise).resolves.toMatchObject({ status: 'replied', reply: null })
  })

  it('runs the turn anyway when the pre-read fails', async () => {
    script({
      'session.resume': sequence(
        rejects(new Error('socket hiccup')),
        resolves({ running: false, messages: [assistant('Answered anyway.')] }),
      ),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => true)
    await poll()

    await expect(promise).resolves.toMatchObject({
      status: 'replied',
      reply: 'Answered anyway.',
    })
  })

  it('normalises a pass into a null reply', async () => {
    script({
      'session.resume': sequence(
        resolves({ messages: [] }),
        resolves({ running: false, messages: [assistant('  (Pass). ')] }),
      ),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => true)
    await poll()

    await expect(promise).resolves.toMatchObject({ status: 'replied', reply: null })
  })

  it('reports a rejected submit as failed, with the wire reason', async () => {
    script({
      'session.resume': resolves({ messages: [] }),
      'prompt.submit': rejects(
        new HermesRpcError(4030, 'busy', 'prompt.submit', { reason: ' agent_busy ' }),
      ),
    })

    await expect(runGroupTurn(turn, () => true)).resolves.toMatchObject({
      status: 'failed',
      reply: null,
      reason: 'agent_busy',
    })
    expect(callsTo('session.resume')).toHaveLength(1)
  })

  it('falls back to the rpc code when the failure carries no reason', async () => {
    script({
      'session.resume': resolves({ messages: [] }),
      'prompt.submit': rejects(new HermesRpcError(4032, 'nope', 'prompt.submit')),
    })

    await expect(runGroupTurn(turn, () => true)).resolves.toMatchObject({
      status: 'failed',
      reply: null,
      reason: 'rpc_4032',
    })
  })

  it('leaves the reason absent when the failure is not an rpc error', async () => {
    script({
      'session.resume': resolves({ messages: [] }),
      'prompt.submit': rejects(new Error('socket closed')),
    })

    const result = await runGroupTurn(turn, () => true)

    expect(result.status).toBe('failed')
    expect(result.reason).toBeUndefined()
  })

  it('strands the turn when the round moves on mid-poll', async () => {
    let current = true
    script({
      'session.resume': sequence(
        resolves({ messages: [] }),
        resolves({ running: true, messages: [] }),
        resolves({ running: false, messages: [assistant('Too late.')] }),
      ),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => current)
    await poll()
    current = false
    await poll()

    await expect(promise).resolves.toMatchObject({ status: 'stranded', reply: null })
    // Pre-read plus the one poll taken while the turn was still current: an
    // abandoned round never reads the session again.
    expect(callsTo('session.resume')).toHaveLength(2)
  })

  it('keeps polling through a transient read failure', async () => {
    script({
      'session.resume': sequence(
        resolves({ messages: [] }),
        rejects(new Error('socket hiccup')),
        resolves({ running: false, messages: [assistant('Survived the blip.')] }),
      ),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => true)
    await poll()
    await poll()

    await expect(promise).resolves.toMatchObject({
      status: 'replied',
      reply: 'Survived the blip.',
    })
  })

  it('fails the turn when the session disappears mid-poll', async () => {
    script({
      'session.resume': sequence(resolves({ messages: [] }), rejects(absent())),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => true)
    await poll()

    await expect(promise).resolves.toMatchObject({
      status: 'failed',
      reply: null,
      reason: 'session_gone',
    })
  })

  /**
   * A stranded turn is not cancelled: the model keeps working server-side and
   * `harvestGroupTurn` collects the answer on a later round.
   */
  it('strands a turn that outlives the timeout instead of failing it', async () => {
    script({
      'session.resume': sequence(
        resolves({ messages: [] }),
        resolves({ running: true, messages: [] }),
      ),
      'prompt.submit': resolves({ status: 'streaming' }),
    })

    const promise = runGroupTurn(turn, () => true)
    await vi.advanceTimersByTimeAsync(GROUP_TURN_TIMEOUT_MS + GROUP_TURN_POLL_MS)

    await expect(promise).resolves.toMatchObject({ status: 'stranded', reply: null })
    expect(callsTo('session.resume').length).toBeGreaterThan(2)
  })
})

// ------------------------------------------------------------- the harvest

describe('harvestGroupTurn', () => {
  /** Resume answers the handle first, then the state read. */
  const handleThen = (...steps: Array<() => unknown>): RequestHandler =>
    sequence(resolves({ session_id: 'sess-live', stored_session_id: 'stored-1' }), ...steps)

  it('maps the durable key to the live id before reading the log', async () => {
    script({
      'session.resume': handleThen(
        resolves({
          running: false,
          messages: [user('kick off'), assistant('Late, but here.')],
        }),
      ),
    })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toMatchObject({ status: 'replied', reply: 'Late, but here.' })
    expect(callsTo('session.resume')).toEqual([
      { session_id: 'stored-1', profile: 'ad-creator', cols: 100, omit_messages: true },
      // The transcript read uses the durable key too — resume never takes the
      // short id, even though the resolve above just handed one back.
      { session_id: 'stored-1', profile: 'ad-creator', cols: 100 },
    ])
  })

  it('returns undefined while the member is still working', async () => {
    script({
      'session.resume': handleThen(
        resolves({ running: true, messages: [assistant('half an ans')] }),
      ),
    })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toBeUndefined()
  })

  it('harvests only what was appended after before', async () => {
    script({
      'session.resume': handleThen(
        resolves({
          running: false,
          messages: [assistant('Last round.'), user('nudge'), assistant('This round.')],
        }),
      ),
    })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 1),
    ).resolves.toMatchObject({ status: 'replied', reply: 'This round.' })
  })

  it('normalises a harvested pass into a null reply', async () => {
    script({
      'session.resume': handleThen(
        resolves({ running: false, messages: [assistant('(pass)')] }),
      ),
    })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toMatchObject({ status: 'replied', reply: null })
  })

  it('keeps the marker when an idle session has nothing past the baseline', async () => {
    // Idle with no growth is "not answered yet", not "answered with silence".
    // Reporting a result here would clear the marker and bin the reply the
    // member is still about to produce.
    script({ 'session.resume': handleThen(resolves({ running: false })) })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toBeUndefined()
  })

  it('harvests once the session has grown past the baseline', async () => {
    script({
      'session.resume': handleThen(
        resolves({
          running: false,
          messages: [
            { role: 'user', content: 'prompt' },
            { role: 'assistant', content: 'the migration finished' },
          ],
        }),
      ),
    })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toMatchObject({ status: 'replied', reply: 'the migration finished' })
  })

  it('reports a session that vanished between resolve and read as failed', async () => {
    script({ 'session.resume': handleThen(rejects(absent())) })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toMatchObject({ status: 'failed', reply: null, reason: 'session_gone' })
  })

  it('keeps the marker on a transient read failure', async () => {
    script({ 'session.resume': handleThen(rejects(new Error('socket hiccup'))) })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toBeUndefined()
  })

  it('keeps the marker when the session cannot even be resolved', async () => {
    script({ 'session.resume': rejects(new Error('socket closed')) })

    await expect(
      harvestGroupTurn('room-42', 'ad-creator', 'stored-1', 0),
    ).resolves.toBeUndefined()
    expect(callsTo('session.resume')).toHaveLength(1)
  })
})

// ----------------------------------------------------------- the interrupt

describe('interruptGroupMember', () => {
  it('interrupts the session by its live id', async () => {
    script({ 'session.interrupt': resolves({}) })

    await interruptGroupMember('sess-live')

    // Interrupt is the one resume-adjacent call that takes the SHORT id — it
    // targets the running turn, not the persisted row.
    expect(request).toHaveBeenCalledWith('session.interrupt', {
      session_id: 'sess-live',
    })
  })

  it('swallows an interrupt that cannot be delivered', async () => {
    script({ 'session.interrupt': rejects(new Error('socket closed')) })

    await expect(interruptGroupMember('sess-live')).resolves.toBeUndefined()
  })
})
