import { describe, expect, it } from 'vitest'
import { formatPackSize } from '.'

describe('formatPackSize', () => {
  it('reports bytes below a kilobyte', () => {
    expect(formatPackSize(0)).toBe('0 B')
    expect(formatPackSize(999)).toBe('999 B')
  })

  it('rounds to whole kilobytes in the range the packs actually occupy', () => {
    expect(formatPackSize(6_536)).toBe('6 KB')
    expect(formatPackSize(73_197)).toBe('71 KB')
  })

  it('switches to one decimal of a megabyte, not a rounded-down zero', () => {
    expect(formatPackSize(1_048_576)).toBe('1.0 MB')
    expect(formatPackSize(2_516_582)).toBe('2.4 MB')
  })

  it('says nothing rather than something wrong for a size it cannot read', () => {
    expect(formatPackSize(Number.NaN)).toBe('')
    expect(formatPackSize(-1)).toBe('')
  })
})
