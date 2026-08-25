import { describe, expect, it, vi, beforeEach } from 'vitest'
import { StrictMode } from 'react'
import { render, waitFor } from '@testing-library/react'
import { FakeSocket } from '@/test/fake-socket'

/**
 * Regression cover for a StrictMode bug that shipped: a `useRef` guard skipped
 * the second effect run, but the first run's cleanup had already removed the
 * gateway listeners. The socket then opened with nobody subscribed and the UI
 * sat on "Connecting to Hermes…" with a permanently disabled composer.
 */

const sockets: FakeSocket[] = []

vi.mock('../../services/hermes/config', () => ({
  gatewaySocketUrl: () => 'ws://localhost/api/ws?token=t',
  authHeaders: () => ({}),
  getSessionToken: () => 't',
  isGatedAuthMode: () => false,
  API_BASE: '',
}))

vi.mock('../../services/hermes/rest', () => ({
  fetchProfiles: async () => [],
}))

vi.stubGlobal(
  'WebSocket',
  class extends FakeSocket {
    constructor(url: string) {
      super(url)
      sockets.push(this)
    }
  },
)

/**
 * The gateway is a module-level singleton, so tests have to reset the module
 * registry rather than share one connection — otherwise the second test finds
 * an already-open gateway, `connect()` returns early, and no socket is dialled.
 */
async function freshModules() {
  vi.resetModules()
  sockets.length = 0

  const { useHermesConnection } = await import('./index')
  const { useChatStore } = await import('../../stores/chat-store')

  const Harness = () => {
    useHermesConnection()
    return null
  }
  const StrictHarness = () => (
    <StrictMode>
      <Harness />
    </StrictMode>
  )

  return { StrictHarness, Harness, useChatStore }
}

describe('useHermesConnection', () => {
  beforeEach(() => {
    sockets.length = 0
  })

  it('reaches "open" under StrictMode double-invoke', async () => {
    const { StrictHarness, useChatStore } = await freshModules()

    render(<StrictHarness />)
    expect(sockets[0]).toBeDefined()
    sockets[0]!.open()

    await waitFor(() => {
      expect(useChatStore.getState().connection).toBe('open')
    })
  })

  it('opens a single socket even though the effect runs twice', async () => {
    const { StrictHarness } = await freshModules()

    render(<StrictHarness />)

    // connect() is idempotent, so the double-invoke must not dial twice.
    expect(sockets).toHaveLength(1)
  })

  it('picks up a socket that opened before this consumer mounted', async () => {
    const { StrictHarness, useChatStore } = await freshModules()

    render(<StrictHarness />)
    sockets[0]!.open()
    await waitFor(() => expect(useChatStore.getState().connection).toBe('open'))

    // A later consumer sees no further state-change event, so the hook has to
    // read the current state rather than wait for one that already fired.
    useChatStore.setState({ connection: 'idle' })
    render(<StrictHarness />)

    await waitFor(() => {
      expect(useChatStore.getState().connection).toBe('open')
    })
  })

  it('still routes events into the store after a remount', async () => {
    const { Harness, useChatStore } = await freshModules()

    const Remounting = ({ show }: { show: boolean }) => (
      <StrictMode>{show ? <Harness /> : null}</StrictMode>
    )

    const { rerender } = render(<Remounting show />)
    sockets[0]!.open()
    await waitFor(() => expect(useChatStore.getState().connection).toBe('open'))

    rerender(<Remounting show={false} />)
    rerender(<Remounting show />)

    // Listeners must have been re-registered by the remount, not left detached.
    sockets[0]!.drop(1006)

    await waitFor(() => {
      expect(useChatStore.getState().connection).toBe('reconnecting')
    })
  })
})
