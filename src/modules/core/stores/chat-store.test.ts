import { describe, expect, it } from 'vitest'
import { reduceEvent, toChatMessage, toChatMessages } from './chat-store'
import type { EmployeeThread } from '../types/chat'
import type { GatewayEvent } from '../services/hermes/gateway'

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
