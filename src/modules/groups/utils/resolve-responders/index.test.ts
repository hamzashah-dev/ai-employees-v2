import { describe, expect, it } from 'vitest'
import type { GroupMessage } from '@/modules/core/types/groups'
import { resolveGroupResponders } from './index'

const MEMBERS = ['alice', 'bob', 'data-analyst']
const THREAD = 't1'

let seq = 0

function user(text: string, thread: string = THREAD): GroupMessage {
  seq += 1
  return { id: `u${seq}`, at: seq, from: { kind: 'user', name: 'You' }, text, thread }
}

function member(name: string, text: string, thread: string = THREAD): GroupMessage {
  seq += 1
  return { id: `m${seq}`, at: seq, from: { kind: 'member', name }, text, thread }
}

describe('resolveGroupResponders', () => {
  it('returns every member when the user addressed nobody', () => {
    const log = [user('what do we think?')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(MEMBERS)
  })

  it('returns every member when the thread has no user entry at all', () => {
    const log = [member('alice', 'still here'), member('bob', '@alice ping')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(MEMBERS)
  })

  it('returns every member for an empty log', () => {
    expect(resolveGroupResponders([], MEMBERS, THREAD)).toEqual(MEMBERS)
  })

  it('narrows to the mentioned members only', () => {
    const log = [user('@bob take this one')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(['bob'])
  })

  it('preserves roster order rather than mention order', () => {
    const log = [user('@data-analyst then @alice')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(['alice', 'data-analyst'])
  })

  it('unions mentions across everything said since the last user entry', () => {
    const log = [
      user('@alice start'),
      member('alice', 'handing to @bob'),
      member('bob', 'and @data-analyst should weigh in'),
    ]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(MEMBERS)
  })

  it('ignores mentions from before the last user entry', () => {
    const log = [
      user('@alice only you'),
      member('alice', 'done'),
      user('@bob now you'),
    ]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(['bob'])
  })

  it('opens the round back up when @everyone appears after a named mention', () => {
    const log = [user('@bob look'), member('bob', 'no idea, @everyone?')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(MEMBERS)
  })

  it('falls back to every member when no mention resolves', () => {
    const log = [user('@carol are you there?')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(MEMBERS)
  })

  it('lets a member re-nominate itself', () => {
    const log = [user('go'), member('bob', '@bob is still on it')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(['bob'])
  })

  it('reads only the requested thread', () => {
    const log = [
      user('@alice in the other thread', 'other'),
      user('@bob in this one'),
      member('alice', '@data-analyst over here', 'other'),
    ]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(['bob'])
    expect(resolveGroupResponders(log, MEMBERS, 'other')).toEqual(['alice', 'data-analyst'])
  })

  it('ignores a user entry that belongs to another thread', () => {
    const log = [member('alice', '@bob ping'), user('@alice hello', 'other')]
    expect(resolveGroupResponders(log, MEMBERS, THREAD)).toEqual(MEMBERS)
  })

  it('returns nothing to do for an empty roster', () => {
    expect(resolveGroupResponders([user('@alice')], [], THREAD)).toEqual([])
  })
})
