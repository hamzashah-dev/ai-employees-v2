import { describe, expect, it } from 'vitest'
import { GROUP_HISTORY_LIMIT } from '../../constants/groups'
import type { GroupMessage } from '../../types/groups'
import { trimGroupLog } from './index'

const DEFAULT_LIMIT = GROUP_HISTORY_LIMIT * 4

function entry(index: number): GroupMessage {
  return {
    id: `m${index}`,
    at: index,
    from: { kind: 'member', name: 'ada' },
    text: `entry ${index}`,
    thread: 't1',
  }
}

function log(count: number): GroupMessage[] {
  return Array.from({ length: count }, (_, index) => entry(index))
}

describe('trimGroupLog — under the limit', () => {
  it('hands back the very same objects when the log is short', () => {
    const input = log(3)
    const watermarks = { ada: 2 }
    const result = trimGroupLog(input, watermarks, 10)

    expect(result.log).toBe(input)
    expect(result.watermarks).toBe(watermarks)
  })

  it('hands back the same objects at exactly the limit', () => {
    const input = log(10)
    const watermarks = { ada: 10 }
    const result = trimGroupLog(input, watermarks, 10)

    expect(result.log).toBe(input)
    expect(result.watermarks).toBe(watermarks)
  })

  it('handles an empty log', () => {
    const result = trimGroupLog([], {}, 10)

    expect(result.log).toEqual([])
    expect(result.watermarks).toEqual({})
  })
})

describe('trimGroupLog — over the limit', () => {
  it('drops the oldest entries from the front', () => {
    const result = trimGroupLog(log(13), {}, 10)

    expect(result.log).toHaveLength(10)
    expect(result.log[0]?.id).toBe('m3')
    expect(result.log.at(-1)?.id).toBe('m12')
  })

  it('shifts every watermark down by the number dropped', () => {
    const result = trimGroupLog(log(13), { ada: 12, grace: 7, linus: 3 }, 10)

    expect(result.watermarks).toEqual({ ada: 9, grace: 4, linus: 0 })
  })

  it('clamps a watermark that pointed into the trimmed-away entries', () => {
    const result = trimGroupLog(log(20), { ada: 0, grace: 2 }, 5)

    expect(result.watermarks).toEqual({ ada: 0, grace: 0 })
  })

  it('keeps every surviving watermark pointing at the entry it pointed at before', () => {
    const input = log(40)
    const drop = 40 - 12
    const watermarks = { ada: 39, grace: 30, linus: drop }
    const result = trimGroupLog(input, watermarks, 12)

    for (const [member, before] of Object.entries(watermarks)) {
      const after = result.watermarks[member] ?? -1
      expect(result.log[after]).toBe(input[before])
    }
  })

  it('trims to zero entries when the limit is zero', () => {
    const result = trimGroupLog(log(4), { ada: 4 }, 0)

    expect(result.log).toEqual([])
    expect(result.watermarks).toEqual({ ada: 0 })
  })

  it('produces an empty watermark map from an empty one', () => {
    expect(trimGroupLog(log(4), {}, 1).watermarks).toEqual({})
  })

  it('mutates neither input', () => {
    const input = log(13)
    const watermarks = { ada: 12 }

    const result = trimGroupLog(input, watermarks, 10)

    expect(input).toHaveLength(13)
    expect(watermarks).toEqual({ ada: 12 })
    expect(result.log).not.toBe(input)
    expect(result.watermarks).not.toBe(watermarks)
  })
})

describe('trimGroupLog — default window', () => {
  it('keeps more than a member is shown, so a slow member can still catch up', () => {
    expect(DEFAULT_LIMIT).toBeGreaterThan(GROUP_HISTORY_LIMIT)
  })

  it('leaves a log at the default limit alone', () => {
    const input = log(DEFAULT_LIMIT)

    expect(trimGroupLog(input, { ada: 0 }).log).toBe(input)
  })

  it('drops the overflow past the default limit', () => {
    const result = trimGroupLog(log(DEFAULT_LIMIT + 5), { ada: DEFAULT_LIMIT + 5 })

    expect(result.log).toHaveLength(DEFAULT_LIMIT)
    expect(result.log[0]?.id).toBe('m5')
    expect(result.watermarks).toEqual({ ada: DEFAULT_LIMIT })
  })
})
