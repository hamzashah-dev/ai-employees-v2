import { describe, expect, it } from 'vitest'
import { reduceEvent, toChatMessage } from './chat-store'
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
    state = reduceEvent(state, event('tool.start', { tool_id: 't1', name: 'web_search' }))
    expect(state.messages[0]?.tools?.[0]).toMatchObject({
      id: 't1',
      name: 'web_search',
      status: 'running',
    })

    state = reduceEvent(
      state,
      event('tool.complete', { tool_id: 't1', name: 'web_search', duration_s: 1.5 }),
    )
    expect(state.messages[0]?.tools?.[0]).toMatchObject({
      status: 'done',
      durationSeconds: 1.5,
    })
  })

  it('moves to needs-you on an approval request', () => {
    const state = reduceEvent(
      thread({ status: 'working' }),
      event('approval.request', { approval_id: 'a1', tool: 'ad_render', summary: 'Render 8 ads?' }),
    )

    expect(state.status).toBe('needs-you')
    expect(state.approval).toMatchObject({ id: 'a1', summary: 'Render 8 ads?' })
  })

  it('stays on needs-you when the turn completes with an approval outstanding', () => {
    let state = reduceEvent(thread(), event('message.start'))
    state = reduceEvent(state, event('approval.request', { approval_id: 'a1', summary: 'ok?' }))
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
