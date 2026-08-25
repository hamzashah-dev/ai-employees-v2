import { describe, expect, it, vi } from 'vitest'
import { HermesGateway, HermesRpcError, describeCloseCode } from './gateway'
import { FakeSocket } from '@/test/fake-socket'

/**
 * `request()` awaits `ready()` before sending, so the frame reaches the socket
 * a few microtasks after the call. Flush them rather than asserting
 * synchronously. Microtasks, not timers, so this works under fake timers too.
 */
async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}

function makeGateway() {
  let socket: FakeSocket | undefined
  const gateway = new HermesGateway({
    url: () => 'ws://localhost/api/ws?token=t',
    requestTimeoutMs: 200,
    maxReconnectDelayMs: 10,
    socketFactory: (url) => {
      socket = new FakeSocket(url)
      return socket as unknown as WebSocket
    },
  })
  return { gateway, getSocket: () => socket! }
}

/** Connect and settle, so tests start from a live socket. */
async function connected() {
  const harness = makeGateway()
  harness.gateway.connect()
  harness.getSocket().open()
  await tick()
  return harness
}

describe('HermesGateway', () => {
  it('correlates a response to its request by id', async () => {
    const { gateway, getSocket } = await connected()

    const pending = gateway.request<{ session_id: string }>('session.create', {
      profile: 'ad-creator',
    })
    await tick()

    const [frame] = getSocket().parsedSent()
    expect(frame?.method).toBe('session.create')
    expect(frame?.params).toEqual({ profile: 'ad-creator' })

    getSocket().reply(frame!.id, { session_id: 'sess-1' })
    await expect(pending).resolves.toEqual({ session_id: 'sess-1' })
  })

  it('keeps concurrent requests apart', async () => {
    const { gateway, getSocket } = await connected()

    const first = gateway.request<string>('a')
    const second = gateway.request<string>('b')
    await tick()

    const frames = getSocket().parsedSent()
    expect(frames).toHaveLength(2)

    // Reply out of order: correlation must be by id, not arrival order.
    getSocket().reply(frames[1]!.id, 'second')
    getSocket().reply(frames[0]!.id, 'first')

    await expect(first).resolves.toBe('first')
    await expect(second).resolves.toBe('second')
  })

  it('rejects with a typed error when the server returns one', async () => {
    const { gateway, getSocket } = await connected()

    const pending = gateway.request('session.create')
    await tick()

    const [frame] = getSocket().parsedSent()
    getSocket().replyError(frame!.id, -32602, 'no such profile')

    await expect(pending).rejects.toBeInstanceOf(HermesRpcError)
  })

  it('routes unsolicited event frames to listeners', async () => {
    const { gateway, getSocket } = await connected()
    const seen: Array<{ type: string; sessionId?: string }> = []
    gateway.onEvent((event) => seen.push({ type: event.type, sessionId: event.sessionId }))

    getSocket().event('message.delta', 'sess-1', { text: 'hi' })
    getSocket().event('gateway.ready', undefined, {})

    expect(seen).toEqual([
      { type: 'message.delta', sessionId: 'sess-1' },
      { type: 'gateway.ready', sessionId: undefined },
    ])
  })

  it('does not let one throwing listener starve the others', async () => {
    const { gateway, getSocket } = await connected()
    const reached: string[] = []
    gateway.onEvent(() => {
      throw new Error('boom')
    })
    gateway.onEvent(() => reached.push('second'))

    getSocket().event('message.delta', 's', { text: 'x' })
    expect(reached).toEqual(['second'])
  })

  it('fails in-flight requests when the socket drops', async () => {
    const { gateway, getSocket } = await connected()

    const pending = gateway.request('session.history')
    await tick() // let it actually reach the wire
    expect(getSocket().parsedSent()).toHaveLength(1)

    getSocket().drop()

    await expect(pending).rejects.toThrow(/socket closed/i)
  })

  it('reconnects after an unexpected drop', async () => {
    vi.useFakeTimers()
    try {
      const { gateway, getSocket } = makeGateway()
      gateway.connect()
      getSocket().open()
      await tick()
      const first = getSocket()

      first.drop()
      expect(gateway.getState()).toBe('reconnecting')

      await vi.advanceTimersByTimeAsync(50)
      expect(getSocket()).not.toBe(first)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not retry when the close code says auth failed', async () => {
    const { gateway, getSocket } = await connected()

    getSocket().drop(4401)
    // Retrying a rejected token just spins; a human has to fix something.
    expect(gateway.getState()).toBe('closed')
  })

  it('survives an unparseable frame', async () => {
    const { gateway, getSocket } = await connected()

    expect(() => getSocket().receive('not json')).not.toThrow()
    expect(gateway.getState()).toBe('open')
  })

  it('times out a request that is never answered', async () => {
    vi.useFakeTimers()
    try {
      const { gateway, getSocket } = makeGateway()
      gateway.connect()
      getSocket().open()
      await tick()

      const pending = gateway.request('session.create')
      const assertion = expect(pending).rejects.toThrow(/timed out/)
      await vi.advanceTimersByTimeAsync(250)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })

  it('reports open once connected', async () => {
    const { gateway } = await connected()
    expect(gateway.getState()).toBe('open')
  })

  it('stops reconnecting once deliberately closed', async () => {
    const { gateway } = await connected()
    gateway.close()
    expect(gateway.getState()).toBe('closed')
  })
})

describe('describeCloseCode', () => {
  it('explains the Hermes-specific codes', () => {
    expect(describeCloseCode(4401)).toMatch(/not authorised/i)
    expect(describeCloseCode(4403)).toMatch(/origin/i)
    expect(describeCloseCode(4404)).toMatch(/disabled/i)
    expect(describeCloseCode(1006)).toMatch(/1006/)
  })
})
