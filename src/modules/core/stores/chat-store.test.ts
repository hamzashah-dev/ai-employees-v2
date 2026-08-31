import { describe, expect, it } from 'vitest'
import { liveUrlFrom, reduceEvent, toChatMessage, toChatMessages, useChatStore } from './chat-store'
import type { EmployeeThread } from '../types/chat'
import type { GatewayEvent } from '../services/hermes/gateway'
import type { SessionManager } from '../services/hermes/session-manager'
import type { HermesWireMessage } from '../services/hermes/types'

function thread(overrides: Partial<EmployeeThread> = {}): EmployeeThread {
  return { profile: 'ad-creator', messages: [], status: 'ready', hydrated: true, ...overrides }
}

function event(type: string, payload: Record<string, unknown> = {}): GatewayEvent {
  return { type, sessionId: 'sess-1', payload }
}

describe('reduceEvent', () => {
  it('plays a full turn from start to completion', () => {
    let state = thread()
    state = reduceEvent(state, event('message.start'))
    expect(state.status).toBe('working')
    expect(state.messages).toHaveLength(1)

    state = reduceEvent(state, event('message.delta', { text: 'Pulled ' }))
    state = reduceEvent(state, event('message.delta', { text: '9 receipts.' }))
    expect(state.messages[0]?.text).toBe('Pulled 9 receipts.')
    expect(state.messages[0]?.streaming).toBe(true)

    state = reduceEvent(state, event('message.complete', { text: 'Pulled 9 receipts.' }))
    expect(state.messages[0]?.streaming).toBe(false)
    expect(state.status).toBe('ready')
    expect(state.workingSince).toBeUndefined()
  })

  it('prefers the final text over accumulated deltas', () => {
    let state = thread()
    state = reduceEvent(state, event('message.start'))
    state = reduceEvent(state, event('message.delta', { text: 'partial' }))
    // Deltas can be lossy if the socket blipped; message.complete is whole.
    state = reduceEvent(state, event('message.complete', { text: 'the complete answer' }))

    expect(state.messages[0]?.text).toBe('the complete answer')
  })

  it('opens a message when a delta arrives with no start', () => {
    // Happens when the UI connects to a session that is already mid-turn.
    const state = reduceEvent(thread(), event('message.delta', { text: 'mid-turn' }))

    expect(state.messages).toHaveLength(1)
    expect(state.messages[0]?.text).toBe('mid-turn')
    expect(state.messages[0]?.streaming).toBe(true)
  })

  it('ignores an empty delta', () => {
    const start = reduceEvent(thread(), event('message.start'))
    const after = reduceEvent(start, event('message.delta', { text: '' }))
    expect(after).toBe(start)
  })

  it('tracks tool calls against the streaming message', () => {
    let state = thread()
    state = reduceEvent(state, event('message.start'))
    state = reduceEvent(
      state,
      event('tool.start', { tool_id: 't1', name: 'skills_list', context: 'Listing skills' }),
    )
    expect(state.messages[0]?.toolCalls.t1).toMatchObject({
      id: 't1',
      name: 'skills_list',
      label: 'Listing skills',
      status: 'running',
    })
    expect(state.messages[0]?.segments).toEqual([
      { type: 'tool_call', id: expect.any(String), toolCallId: 't1' },
    ])

    state = reduceEvent(state, event('tool.complete', { tool_id: 't1', name: 'skills_list' }))
    expect(state.messages[0]?.toolCalls.t1?.status).toBe('done')
    // tool.complete carries no `context`, so it must not blank the label.
    expect(state.messages[0]?.toolCalls.t1?.label).toBe('Listing skills')
    expect(state.messages[0]?.segments).toHaveLength(1)
  })

  it('handles a tool.complete that never had a tool.start', () => {
    // Real: with tool progress off the gateway suppresses `tool.start` but
    // still emits `tool.complete` when the payload carries an inline diff.
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(
      state,
      event('tool.complete', { tool_id: 't9', name: 'edit', inline_diff: '- a\n+ b' }),
    )

    expect(state.messages[0]?.toolCalls.t9).toMatchObject({ name: 'edit', status: 'done' })
    expect(state.messages[0]?.segments).toEqual([
      { type: 'tool_call', id: expect.any(String), toolCallId: 't9' },
    ])
  })

  it('keeps segment order when calls complete out of order', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('tool.start', { tool_id: 't1', name: 'a' }))
    state = reduceEvent(state, event('tool.start', { tool_id: 't2', name: 'b' }))
    state = reduceEvent(state, event('tool.complete', { tool_id: 't2', name: 'b' }))
    state = reduceEvent(state, event('tool.complete', { tool_id: 't1', name: 'a' }))
    // A late duplicate start must not resurrect a settled row or reorder it.
    state = reduceEvent(state, event('tool.start', { tool_id: 't2', name: 'b' }))

    expect(state.messages[0]?.segments.map((s) => s.type === 'tool_call' && s.toolCallId)).toEqual([
      't1',
      't2',
    ])
    expect(state.messages[0]?.toolCalls.t2?.status).toBe('done')
  })

  it('accumulates reasoning deltas into one block', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('reasoning.delta', { text: ' The user wants' }))
    state = reduceEvent(state, event('reasoning.delta', { text: ' nine receipts.' }))

    // Leading space trimmed: markdown renders it as a code fence otherwise.
    expect(state.messages[0]?.thinkingBlocks).toEqual([
      { id: expect.any(String), text: 'The user wants nine receipts.' },
    ])
    expect(state.messages[0]?.segments).toHaveLength(1)
  })

  it('starts a new thinking block after a tool call interrupts the reasoning', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('reasoning.delta', { text: 'first thought' }))
    state = reduceEvent(state, event('tool.start', { tool_id: 't1', name: 'todo' }))
    state = reduceEvent(state, event('tool.complete', { tool_id: 't1', name: 'todo' }))
    state = reduceEvent(state, event('reasoning.delta', { text: 'second thought' }))
    state = reduceEvent(state, event('message.delta', { text: 'Done.' }))

    expect(state.messages[0]?.thinkingBlocks.map((b) => b.text)).toEqual([
      'first thought',
      'second thought',
    ])
    expect(state.messages[0]?.segments.map((s) => s.type)).toEqual([
      'thinking',
      'tool_call',
      'thinking',
      'text',
    ])
  })

  it('ignores thinking.delta and reasoning.available', () => {
    // thinking.delta is the kawaii spinner face; reasoning.available is the
    // first 500 chars of the *answer*, mislabelled. Neither is reasoning.
    const start = reduceEvent(thread(), event('message.start'))
    let state = reduceEvent(start, event('thinking.delta', { text: '(\u2310\u25a0_\u25a0) cogitating...' }))
    state = reduceEvent(state, event('reasoning.available', { text: 'Pulled 9 receipts' }))

    expect(state).toBe(start)
  })

  it('clears a stranded working state on session.info', () => {
    // message.complete is skipped when the turn dispatcher throws; session.info
    // is emitted in the finally of every turn, so it is the real terminal.
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('message.delta', { text: 'half an ans' }))
    state = reduceEvent(state, event('session.info', { running: false }))

    expect(state.status).toBe('ready')
    expect(state.workingSince).toBeUndefined()
    expect(state.messages[0]?.streaming).toBe(false)
  })

  it('leaves a running turn alone when session.info reports running', () => {
    // session.create / session.resume / config.set emit the same frame.
    const working = reduceEvent(thread(), event('message.start'))
    expect(reduceEvent(working, event('session.info', { running: true }))).toBe(working)
  })

  it('reaps tool calls left running when the turn ends', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('tool.start', { tool_id: 't1', name: 'ad_render' }))
    state = reduceEvent(state, event('session.info', { running: false }))

    // An interrupt mid-tool must not leave the row spinning forever.
    expect(state.messages[0]?.toolCalls.t1?.status).toBe('failed')
  })

  it('reaps orphaned tool calls on an error terminal too', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('tool.start', { tool_id: 't1', name: 'ad_render' }))
    state = reduceEvent(state, event('error', { message: 'model unavailable' }))

    expect(state.messages[0]?.toolCalls.t1?.status).toBe('failed')
  })

  it('moves to needs-you on an approval request', () => {
    // The payload has no id and no tool name: description + command is all it
    // carries, and approval.respond is keyed by session.
    const state = reduceEvent(
      thread({ status: 'working' }),
      event('approval.request', { description: 'Render 8 ads?', command: 'ad_render --n 8' }),
    )

    expect(state.status).toBe('needs-you')
    expect(state.approval).toMatchObject({
      summary: 'Render 8 ads?',
      detail: 'ad_render --n 8',
    })
  })

  it('stays on needs-you when the turn completes with an approval outstanding', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('approval.request', { description: 'ok?' }))
    state = reduceEvent(state, event('message.complete', { text: 'done' }))

    expect(state.status).toBe('needs-you')
  })

  it('parks the thread on needs-you for a clarify request', () => {
    // The gateway has blocked the whole agent thread inside `_block()` waiting
    // for `clarify.respond`; this is the login handoff.
    const state = reduceEvent(
      thread({ status: 'working' }),
      event('clarify.request', {
        request_id: 'c1',
        question: 'Finish the LinkedIn login, then tell me when you are in.',
        choices: ['done', 'skip'],
      }),
    )

    expect(state.status).toBe('needs-you')
    expect(state.clarify).toEqual({
      requestId: 'c1',
      question: 'Finish the LinkedIn login, then tell me when you are in.',
      choices: ['done', 'skip'],
    })
  })

  it('ignores a clarify request with no request_id to answer', () => {
    const before = thread({ status: 'working' })
    expect(reduceEvent(before, event('clarify.request', { question: 'hm?' }))).toBe(before)
  })

  it('omits choices when the clarify is free-text', () => {
    const state = reduceEvent(thread(), event('clarify.request', { request_id: 'c1' }))
    expect(state.clarify).toEqual({ requestId: 'c1', question: '' })
  })

  it('stays on needs-you when the turn completes with a clarify outstanding', () => {
    // The agent can emit its turn terminal around an open card; downgrading to
    // `ready` would hide the one thread that is actually waiting on the human.
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('clarify.request', { request_id: 'c1', question: 'in?' }))
    state = reduceEvent(state, event('message.complete', { text: 'waiting' }))

    expect(state.status).toBe('needs-you')
    expect(state.clarify?.requestId).toBe('c1')
  })

  it('keeps needs-you through the session.info terminal too', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('clarify.request', { request_id: 'c1', question: 'in?' }))
    state = reduceEvent(state, event('session.info', { running: false }))

    expect(state.status).toBe('needs-you')
  })

  it('clears the clarify on expire and resumes the turn', () => {
    // `clarify.expire` is the only expiry signal there is — the wait is 3600s by
    // default and unlimited when `agent.clarify_timeout <= 0`, so no client may
    // time a card out itself.
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('clarify.request', { request_id: 'c1', question: 'in?' }))
    state = reduceEvent(state, event('clarify.expire', { request_id: 'c1' }))

    expect(state.clarify).toBeUndefined()
    expect(state.status).toBe('working')
  })

  it('ignores an expire for a clarify that is not the open one', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('clarify.request', { request_id: 'c2', question: 'in?' }))
    const after = reduceEvent(state, event('clarify.expire', { request_id: 'c1' }))

    expect(after).toBe(state)
    expect(after.clarify?.requestId).toBe('c2')
  })

  it('keeps needs-you when a clarify expires with an approval still open', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('clarify.request', { request_id: 'c1', question: 'in?' }))
    state = reduceEvent(state, event('approval.request', { description: 'ok?' }))
    state = reduceEvent(state, event('clarify.expire', { request_id: 'c1' }))

    expect(state.clarify).toBeUndefined()
    expect(state.status).toBe('needs-you')
  })

  it('parks the thread on needs-you for a secret request', () => {
    // A skill declared a required env var that is missing, and the gateway is
    // parked inside `_block()` with NO timeout waiting for `secret.respond`.
    const state = reduceEvent(
      thread({ status: 'working' }),
      event('secret.request', {
        request_id: 's1',
        env_var: 'LINEAR_API_KEY',
        prompt: 'Paste a Linear API key — Settings → API → Personal keys.',
        metadata: { skill: 'linear-triage' },
      }),
    )

    expect(state.status).toBe('needs-you')
    // The request, and only the request. There is no `value` field to fill.
    expect(state.secret).toEqual({
      requestId: 's1',
      envVar: 'LINEAR_API_KEY',
      prompt: 'Paste a Linear API key — Settings → API → Personal keys.',
      metadata: { skill: 'linear-triage' },
    })
  })

  it('ignores a secret request with no request_id to answer', () => {
    const before = thread({ status: 'working' })
    expect(reduceEvent(before, event('secret.request', { env_var: 'LINEAR_API_KEY' }))).toBe(before)
  })

  it('omits metadata when the secret request carries none', () => {
    const state = reduceEvent(thread(), event('secret.request', { request_id: 's1' }))
    expect(state.secret).toEqual({ requestId: 's1', envVar: '', prompt: '' })
  })

  it('replaces a standing secret request with a second one', () => {
    let state = reduceEvent(thread(), event('secret.request', { request_id: 's1', env_var: 'A' }))
    state = reduceEvent(state, event('secret.request', { request_id: 's2', env_var: 'B' }))

    expect(state.secret).toEqual({ requestId: 's2', envVar: 'B', prompt: '' })
    expect(state.status).toBe('needs-you')
  })

  it('holds needs-you through both turn terminals while a secret stands', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('secret.request', { request_id: 's1', env_var: 'A' }))

    expect(reduceEvent(state, event('message.complete', { text: 'waiting' })).status).toBe(
      'needs-you',
    )
    expect(reduceEvent(state, event('session.info', { running: false })).status).toBe('needs-you')
  })

  it('clears the secret on expire and resumes the turn', () => {
    // The secret wait is given no timeout at all, so `secret.expire` is the only
    // thing that ends it — the UI must never time a card out itself.
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('secret.request', { request_id: 's1', env_var: 'A' }))
    state = reduceEvent(state, event('secret.expire', { request_id: 's1' }))

    expect(state.secret).toBeUndefined()
    expect(state.status).toBe('working')
  })

  it('ignores an expire for a secret that is not the open one', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('secret.request', { request_id: 's2', env_var: 'A' }))
    const after = reduceEvent(state, event('secret.expire', { request_id: 's1' }))

    expect(after).toBe(state)
    expect(after.secret?.requestId).toBe('s2')
  })

  it('ignores an expire when no secret is open', () => {
    const before = thread({ status: 'working' })
    expect(reduceEvent(before, event('secret.expire', { request_id: 's1' }))).toBe(before)
  })

  it('keeps needs-you when a secret expires with a clarify still open', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('secret.request', { request_id: 's1', env_var: 'A' }))
    state = reduceEvent(state, event('clarify.request', { request_id: 'c1', question: 'in?' }))
    state = reduceEvent(state, event('secret.expire', { request_id: 's1' }))

    expect(state.secret).toBeUndefined()
    expect(state.status).toBe('needs-you')
  })

  it('keeps needs-you when a clarify expires with a secret still open', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('clarify.request', { request_id: 'c1', question: 'in?' }))
    state = reduceEvent(state, event('secret.request', { request_id: 's1', env_var: 'A' }))
    state = reduceEvent(state, event('clarify.expire', { request_id: 'c1' }))

    expect(state.clarify).toBeUndefined()
    expect(state.status).toBe('needs-you')
  })

  it('never lands a secret value in the thread, whatever the payload carries', () => {
    // The wire has no value field, but a payload that grew one must not leak it
    // into rendered state by being spread in wholesale.
    const state = reduceEvent(
      thread(),
      event('secret.request', {
        request_id: 's1',
        env_var: 'LINEAR_API_KEY',
        value: 'lin_api_NEVERSTORED',
      }),
    )

    expect(JSON.stringify(state)).not.toContain('lin_api_NEVERSTORED')
  })

  it('captures the toolsets from a session.info that is not a turn terminal', () => {
    // `info.tools` only ever rides the create/resume/config emissions, i.e. the
    // ones the turn-terminal gate drops. Merging below the gate meant the UI
    // never learned that a profile has the browser toolset at all.
    const state = reduceEvent(
      thread(),
      event('session.info', {
        running: true,
        tools: { browser: ['browser_navigate', 'browser_click'], web: ['web_search'] },
      }),
    )

    expect(state.toolsets?.browser).toEqual(['browser_navigate', 'browser_click'])
  })

  it('merges later toolsets over the ones already known', () => {
    let state = reduceEvent(thread(), event('session.info', { tools: { web: ['web_search'] } }))
    state = reduceEvent(state, event('session.info', { tools: { browser: ['browser_navigate'] } }))

    expect(Object.keys(state.toolsets ?? {})).toEqual(['web', 'browser'])
  })

  it('still ends the turn on the session.info that carries toolsets', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('session.info', { running: false, tools: { web: ['x'] } }))

    expect(state.status).toBe('ready')
    expect(state.toolsets?.web).toEqual(['x'])
  })

  it('marks the streaming message with an error', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('error', { message: 'model unavailable' }))

    expect(state.status).toBe('error')
    expect(state.messages[0]?.error).toBe('model unavailable')
    expect(state.messages[0]?.streaming).toBe(false)
  })

  it('records free-text status updates', () => {
    const state = reduceEvent(thread(), event('status.update', { text: 'Researching 14 prospects' }))
    expect(state.statusText).toBe('Researching 14 prospects')
  })

  it('ignores event types it does not model', () => {
    const before = thread()
    // Hermes emits more frame types than this UI handles; a new one must not
    // corrupt or crash the thread.
    const after = reduceEvent(before, event('some.future.event', { anything: true }))
    expect(after).toBe(before)
  })
})

describe('toChatMessage', () => {
  it('reads a plain string content', () => {
    expect(toChatMessage({ role: 'user', content: 'hello' })?.text).toBe('hello')
  })

  it('flattens structured content parts', () => {
    const message = toChatMessage({
      role: 'assistant',
      content: [{ type: 'text', text: 'one ' }, { type: 'text', text: 'two' }],
    })
    expect(message?.text).toBe('one two')
  })

  it('maps any non-user role to the employee', () => {
    expect(toChatMessage({ role: 'assistant', content: 'x' })?.role).toBe('employee')
    expect(toChatMessage({ role: 'user', content: 'x' })?.role).toBe('user')
  })

  it('drops a message with no renderable text', () => {
    expect(toChatMessage({ role: 'assistant', content: [] })).toBeNull()
  })
})

describe('toChatMessages', () => {
  it('folds flattened tool rows into the assistant message that follows them', () => {
    const messages = toChatMessages([
      { role: 'user', content: 'plan the ads' },
      { role: 'tool', name: 'skills_list', context: 'Listing skills' },
      { role: 'tool', name: 'ad_plan', context: '' },
      { role: 'assistant', content: 'Here is the plan.', reasoning: 'Need the skill deck first.' },
    ])

    expect(messages).toHaveLength(2)
    const reply = messages[1]
    expect(Object.values(reply?.toolCalls ?? {}).map((c) => [c.name, c.label, c.status])).toEqual([
      ['skills_list', 'Listing skills', 'done'],
      // No `_TOOL_VERBS` entry server-side, so no label survives for forge tools.
      ['ad_plan', undefined, 'done'],
    ])
    expect(reply?.segments.map((s) => s.type)).toEqual([
      'tool_call',
      'tool_call',
      'thinking',
      'text',
    ])
    expect(reply?.thinkingBlocks[0]?.text).toBe('Need the skill deck first.')
  })

  it('keeps tool rows off a user bubble when the assistant row was dropped', () => {
    // An assistant turn carrying only tool calls is dropped whole by the
    // backend serializer, so the next row can be the following user prompt.
    const messages = toChatMessages([
      { role: 'tool', name: 'todo', context: 'Updating tasks' },
      { role: 'user', content: 'next' },
    ])

    expect(messages.map((m) => m.role)).toEqual(['employee', 'user'])
    expect(Object.keys(messages[0]?.toolCalls ?? {})).toHaveLength(1)
    expect(messages[1]?.toolCalls).toEqual({})
  })
})

/**
 * The live view is the one part of the panel a user can see fail without this
 * app knowing, so what goes in the frame's `src` is worth pinning down.
 */
describe('liveUrlFrom', () => {
  it('tells noVNC to connect and to fit the frame', () => {
    const url = new URL(liveUrlFrom({ vnc_url: 'http://127.0.0.1:6080/vnc.html' }) ?? '')

    // A bare /vnc.html renders noVNC's own splash with a Connect button: the
    // frame loads, shows a logo instead of the browser, and reads as broken.
    expect(url.searchParams.get('autoconnect')).toBe('1')
    // And the remote display is 1920x1080; drawn 1:1 the panel shows a corner.
    expect(url.searchParams.get('resize')).toBe('scale')
    expect(url.pathname).toBe('/vnc.html')
    expect(url.port).toBe('6080')
  })

  it('keeps a routable host and drops anything that is not a URL', () => {
    // A real hostname is left alone — only bare/loopback names get rewritten to
    // the page's own host, and jsdom serves this on localhost.
    expect(liveUrlFrom({ vnc_url: 'http://camofox.internal:6080/vnc.html' })).toContain(
      'camofox.internal',
    )
    expect(liveUrlFrom({ vnc_url: 'not a url' })).toBeUndefined()
    expect(liveUrlFrom({ vnc_url: '' })).toBeUndefined()
    expect(liveUrlFrom({})).toBeUndefined()
    expect(liveUrlFrom(null)).toBeUndefined()
  })
})

describe('hydrate', () => {
  function bindHistory(
    history: (profile: string) => Promise<{ messages?: HermesWireMessage[] }>,
  ) {
    const calls: string[] = []
    useChatStore.setState({ threads: {} })
    useChatStore.getState().bind({
      history: (profile: string) => {
        calls.push(profile)
        return history(profile)
      },
    } as unknown as SessionManager)
    return calls
  }

  it('replays a restored transcript into the thread', async () => {
    bindHistory(async () => ({
      messages: [
        { role: 'user', text: 'generate me a cat' },
        { role: 'assistant', text: "Here's your cat!" },
      ],
    }))

    await useChatStore.getState().hydrate('ad-creator')

    const restored = useChatStore.getState().threads['ad-creator']
    expect(restored?.hydrated).toBe(true)
    expect(restored?.messages.map((m) => m.text)).toEqual([
      'generate me a cat',
      "Here's your cat!",
    ])
  })

  /**
   * `hydrated` is only set when the read resolves, so it does not close the
   * window on its own: StrictMode double-invokes the effect, and both arrivals
   * would otherwise pull a full transcript over the socket.
   */
  it('reads a transcript once when two callers arrive together', async () => {
    const calls = bindHistory(async () => ({ messages: [{ role: 'user', text: 'hi' }] }))

    await Promise.all([
      useChatStore.getState().hydrate('ad-creator'),
      useChatStore.getState().hydrate('ad-creator'),
    ])

    expect(calls).toEqual(['ad-creator'])
  })

  it('puts a failed restore on the thread instead of leaving it blank forever', async () => {
    bindHistory(async () => {
      throw new Error('socket is not open')
    })

    await useChatStore.getState().hydrate('ad-creator')

    const failed = useChatStore.getState().threads['ad-creator']
    expect(failed?.error).toBe('socket is not open')
    // Hydrated even so: the thread is settled, and the error is what it shows.
    expect(failed?.hydrated).toBe(true)
  })

  it('lets a later call retry after a failure', async () => {
    const calls = bindHistory(async () => ({ messages: [] }))
    await useChatStore.getState().hydrate('ad-creator')
    await useChatStore.getState().hydrate('ad-creator')

    // The second is a no-op: the first already settled the thread.
    expect(calls).toEqual(['ad-creator'])
  })
})

/**
 * The value the human types must reach `secret.respond` and nothing else: not
 * the store, not an error message, not a log line. Hermes keeps it out of the
 * tool result too, which is what makes the card's "never printed in the
 * transcript" claim true end to end — but only if this half holds up.
 */
describe('answering a secret request', () => {
  const VALUE = 'lin_api_0PENSESAME'

  interface Attempt {
    method: 'respondSecret' | 'skipSecret'
    args: unknown[]
  }

  function bindSecrets(onCall?: () => void): Attempt[] {
    const attempts: Attempt[] = []
    useChatStore.setState({ threads: {} })
    useChatStore.getState().bind({
      respondSecret: async (...args: unknown[]) => {
        attempts.push({ method: 'respondSecret', args })
        onCall?.()
      },
      skipSecret: async (...args: unknown[]) => {
        attempts.push({ method: 'skipSecret', args })
        onCall?.()
      },
    } as unknown as SessionManager)
    return attempts
  }

  function standing(): void {
    useChatStore.setState({
      threads: {
        'ad-creator': thread({
          status: 'needs-you',
          secret: { requestId: 's1', envVar: 'LINEAR_API_KEY', prompt: 'Paste a Linear key.' },
        }),
      },
    })
  }

  it('forwards the value once and drops the card', async () => {
    const attempts = bindSecrets()
    standing()

    await useChatStore.getState().submitSecret('ad-creator', VALUE)

    expect(attempts).toEqual([{ method: 'respondSecret', args: ['ad-creator', 's1', VALUE] }])
    const after = useChatStore.getState().threads['ad-creator']
    expect(after?.secret).toBeUndefined()
    // The parked agent thread carries on with its turn.
    expect(after?.status).toBe('working')
    expect(JSON.stringify(useChatStore.getState().threads)).not.toContain(VALUE)
  })

  it('declines with no value at all', async () => {
    const attempts = bindSecrets()
    standing()

    await useChatStore.getState().skipSecret('ad-creator')

    // "Not now" is a real answer — it releases the thread rather than dismissing
    // a card and leaving the agent parked.
    expect(attempts).toEqual([{ method: 'skipSecret', args: ['ad-creator', 's1'] }])
    expect(useChatStore.getState().threads['ad-creator']?.secret).toBeUndefined()
  })

  it('keeps the card standing when the send fails, without leaking the value', async () => {
    bindSecrets(() => {
      throw new Error('socket is not open')
    })
    standing()

    await useChatStore.getState().submitSecret('ad-creator', VALUE)

    const after = useChatStore.getState().threads['ad-creator']
    // Still parked, so retrying is the only way through.
    expect(after?.secret?.requestId).toBe('s1')
    expect(after?.error).toBe('socket is not open')
    expect(JSON.stringify(after)).not.toContain(VALUE)
  })

  it('leaves a newer request alone when the answered one resolves', async () => {
    bindSecrets(() => {
      // A second request landed while the RPC was in flight.
      useChatStore.setState({
        threads: {
          'ad-creator': thread({
            status: 'needs-you',
            secret: { requestId: 's2', envVar: 'STRIPE_KEY', prompt: 'And this one.' },
          }),
        },
      })
    })
    standing()

    await useChatStore.getState().submitSecret('ad-creator', VALUE)

    const after = useChatStore.getState().threads['ad-creator']
    expect(after?.secret?.requestId).toBe('s2')
    expect(after?.status).toBe('needs-you')
  })

  it('sends nothing when no request is standing', async () => {
    const attempts = bindSecrets()
    useChatStore.setState({ threads: { 'ad-creator': thread() } })

    await useChatStore.getState().submitSecret('ad-creator', VALUE)
    await useChatStore.getState().skipSecret('ad-creator')

    expect(attempts).toEqual([])
  })
})
