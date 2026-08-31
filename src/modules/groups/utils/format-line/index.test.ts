import { describe, expect, it } from 'vitest'
import type { GroupMessage, GroupMessageAuthor } from '@/modules/core/types/groups'
import { formatGroupLine } from './index'

function message(from: GroupMessageAuthor, text: string): GroupMessage {
  return { id: 'e1', at: 1_700_000_000_000, from, text, thread: 't1' }
}

describe('formatGroupLine', () => {
  it('tags a user entry so members never mistake the room owner for a teammate', () => {
    const line = formatGroupLine(message({ kind: 'user', name: 'You' }, 'ship it'), 'alice')

    expect(line).toBe('You (user): ship it')
  })

  it('renders a teammate as a bare name', () => {
    const line = formatGroupLine(message({ kind: 'member', name: 'bob' }, 'on it'), 'alice')

    expect(line).toBe('bob: on it')
  })

  it('marks the reading member so it cannot answer itself', () => {
    const line = formatGroupLine(message({ kind: 'member', name: 'alice' }, 'on it'), 'alice')

    expect(line).toBe('alice (you): on it')
  })

  it('gives the same entry a different line for each reader', () => {
    const entry = message({ kind: 'member', name: 'alice' }, 'taking the schema')

    expect(formatGroupLine(entry, 'alice')).toBe('alice (you): taking the schema')
    expect(formatGroupLine(entry, 'bob')).toBe('alice: taking the schema')
  })

  it('never marks a user entry as the reader, even on a name collision', () => {
    // The viewer label on a user entry is a display string, not a roster name;
    // a member that happens to share it is still reading somebody else's line.
    const line = formatGroupLine(message({ kind: 'user', name: 'alice' }, 'ship it'), 'alice')

    expect(line).toBe('alice (user): ship it')
  })

  it('passes the text through untouched', () => {
    const text = 'see: line one\nline two — with @bob and "quotes"'
    const line = formatGroupLine(message({ kind: 'member', name: 'bob' }, text), 'alice')

    expect(line).toBe(`bob: ${text}`)
  })
})
