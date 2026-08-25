import { describe, expect, it } from 'vitest'
import type { EmployeeStatus } from '@/modules/core/types/chat'
import { liveNavSignal, type LiveThreads } from '.'

const threads = (...statuses: EmployeeStatus[]): LiveThreads =>
  Object.fromEntries(statuses.map((status, index) => [`p${index}`, { status }]))

describe('liveNavSignal', () => {
  it('is absent when nobody is live, so the row keeps its Beta badge', () => {
    expect(liveNavSignal({})).toBeNull()
    expect(liveNavSignal(threads('ready', 'ready'))).toBeNull()
  })

  it('counts the working employees', () => {
    expect(liveNavSignal(threads('working', 'working', 'working', 'ready'))).toEqual({
      count: 3,
      tone: 'working',
      label: '3 employees working',
    })
  })

  it('warning outranks working when both are true', () => {
    const signal = liveNavSignal(threads('working', 'working', 'working', 'needs-you'))

    expect(signal?.tone).toBe('needs-you')
    // The count stays the whole live team; only the colour changes.
    expect(signal?.count).toBe(4)
    expect(signal?.label).toBe('4 employees active, 1 needs a yes')
  })

  it('reads an errored turn as needing the reader, like the row and the pill do', () => {
    expect(liveNavSignal(threads('error'))).toEqual({
      count: 1,
      tone: 'needs-you',
      label: '1 employee needs a yes',
    })
  })

  it('gets the grammar right on either side of one', () => {
    expect(liveNavSignal(threads('working'))?.label).toBe('1 employee working')
    expect(liveNavSignal(threads('needs-you', 'error'))?.label).toBe(
      '2 employees need a yes',
    )
    expect(liveNavSignal(threads('working', 'needs-you', 'error'))?.label).toBe(
      '3 employees active, 2 need a yes',
    )
  })
})
