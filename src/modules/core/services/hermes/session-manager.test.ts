import { describe, expect, it, vi } from 'vitest'
import { SessionManager, UnknownProfileError } from './session-manager'
import type { HermesGateway } from './gateway'

function makeManager(options: {
  known?: string[]
  request?: ReturnType<typeof vi.fn>
}) {
  const request =
    options.request ?? vi.fn().mockResolvedValue({ session_id: 'sess-1' })
  const gateway = { request } as unknown as HermesGateway
  const listProfileNames = vi.fn().mockResolvedValue(options.known ?? ['ad-creator'])
  const manager = new SessionManager(gateway, { listProfileNames })
  return { manager, request, listProfileNames }
}

describe('SessionManager', () => {
  it('creates a session bound to the requested profile', async () => {
    const { manager, request } = makeManager({ known: ['ad-creator'] })

    await manager.ensureSession('ad-creator')

    expect(request).toHaveBeenCalledWith(
      'session.create',
      expect.objectContaining({ profile: 'ad-creator' }),
    )
  })

  it('reuses the session for an employee rather than creating a second', async () => {
    const { manager, request } = makeManager({ known: ['ad-creator'] })

    const a = await manager.ensureSession('ad-creator')
    const b = await manager.ensureSession('ad-creator')

    expect(a).toBe(b)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('creates only one session when concurrent callers race', async () => {
    const { manager, request } = makeManager({ known: ['ad-creator'] })

    const [a, b] = await Promise.all([
      manager.ensureSession('ad-creator'),
      manager.ensureSession('ad-creator'),
    ])

    expect(a).toBe(b)
    expect(request).toHaveBeenCalledTimes(1)
  })

  /**
   * The load-bearing test. Hermes resolves an unknown profile to the launch
   * profile instead of erroring, and echoes back a profile_name that is always
   * the process-global one — so a typo silently routes a marketing brief to the
   * generic agent, undetectably. Refusing up front is the only defence.
   */
  it('refuses to open a session for an unknown employee', async () => {
    const { manager, request } = makeManager({ known: ['ad-creator'] })

    await expect(manager.ensureSession('ad-cretor')).rejects.toBeInstanceOf(
      UnknownProfileError,
    )
    expect(request).not.toHaveBeenCalled()
  })

  it('re-checks the roster once before rejecting, so a new hire works', async () => {
    const listProfileNames = vi
      .fn()
      .mockResolvedValueOnce(['ad-creator'])
      .mockResolvedValueOnce(['ad-creator', 'talent-scout'])
    const request = vi.fn().mockResolvedValue({ session_id: 'sess-2' })
    const manager = new SessionManager({ request } as unknown as HermesGateway, {
      listProfileNames,
    })

    await expect(manager.ensureSession('talent-scout')).resolves.toBe('sess-2')
    expect(listProfileNames).toHaveBeenCalledTimes(2)
  })

  it('maps a session id back to its employee', async () => {
    const { manager } = makeManager({ known: ['ad-creator'] })
    await manager.ensureSession('ad-creator')

    expect(manager.profileForSession('sess-1')).toBe('ad-creator')
    expect(manager.profileForSession('other')).toBeUndefined()
  })

  it('sends prompts to the session bound to that employee', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({ session_id: 'sess-a' })
      .mockResolvedValueOnce({ status: 'streaming' })
    const { manager } = makeManager({ known: ['ad-creator'], request })

    await manager.submit('ad-creator', 'hello')

    expect(request).toHaveBeenLastCalledWith('prompt.submit', {
      session_id: 'sess-a',
      text: 'hello',
    })
  })

  it('drops cached sessions on reset so a reconnect recreates them', async () => {
    const { manager, request } = makeManager({ known: ['ad-creator'] })
    await manager.ensureSession('ad-creator')
    manager.reset()
    await manager.ensureSession('ad-creator')

    expect(request).toHaveBeenCalledTimes(2)
  })

  it('does nothing when interrupting an employee with no session', async () => {
    const { manager, request } = makeManager({ known: ['ad-creator'] })
    await manager.interrupt('ad-creator')
    expect(request).not.toHaveBeenCalled()
  })

  it('throws when the server returns no session id', async () => {
    const request = vi.fn().mockResolvedValue({})
    const { manager } = makeManager({ known: ['ad-creator'], request })

    await expect(manager.ensureSession('ad-creator')).rejects.toThrow(/no session_id/)
  })
})
