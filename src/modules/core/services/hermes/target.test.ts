import { describe, expect, it } from 'vitest'
import { classifyHermesUrl, describeHermesTarget, isHermesTarget } from './target'

describe('classifyHermesUrl', () => {
  it('reads every loopback spelling as the local dashboard', () => {
    expect(classifyHermesUrl('http://127.0.0.1:9121')).toBe('local')
    expect(classifyHermesUrl('http://localhost:9121')).toBe('local')
    expect(classifyHermesUrl('http://0.0.0.0:9121')).toBe('local')
    expect(classifyHermesUrl('http://[::1]:9121')).toBe('local')
  })

  it('reads the cloud VM as the vm target, path prefix and all', () => {
    expect(classifyHermesUrl('https://vm-8ky5zqjqcj3t.imaginecloud.app/dashboard')).toBe('vm')
    expect(classifyHermesUrl('https://vm-8ky5zqjqcj3t.imaginecloud.app')).toBe('vm')
  })

  it('does not let a LAN address pass as local', () => {
    // Same machine to a human, a different Hermes to the app.
    expect(classifyHermesUrl('http://192.168.1.20:9121')).toBe('vm')
  })

  it('treats an unparseable URL as remote so the mismatch check still fires', () => {
    expect(classifyHermesUrl('127.0.0.1:9121')).toBe('vm')
    expect(classifyHermesUrl('')).toBe('vm')
  })
})

describe('isHermesTarget', () => {
  it('accepts the known labels and nothing else', () => {
    expect(isHermesTarget('local')).toBe(true)
    expect(isHermesTarget('vm')).toBe(true)
    expect(isHermesTarget('VM')).toBe(false)
    expect(isHermesTarget('staging')).toBe(false)
    expect(isHermesTarget(undefined)).toBe(false)
  })
})

describe('describeHermesTarget', () => {
  it('names each target in words a startup banner can print', () => {
    expect(describeHermesTarget('local')).toBe('local dashboard')
    expect(describeHermesTarget('vm')).toBe('cloud VM')
  })
})
