import { describe, expect, it } from 'vitest'
import type { GroupMessage, GroupRoom } from '../../types/groups'
import { groupActivityMs, groupNeedsYou, groupSubtitle, toGroupRow } from './index'

const entry = (
  name: string,
  text: string,
  at: number,
  kind: 'member' | 'user' = 'member',
): GroupMessage => ({ id: `${name}-${at}`, at, from: { kind, name }, text, thread: 't' })

const room = (over: Partial<GroupRoom> = {}): GroupRoom => ({
  id: 'r-1',
  name: 'Launch',
  members: ['UX Research', 'Design', 'Chief of Staff'],
  log: [],
  watermarks: {},
  sessions: {},
  holds: {},
  stranded: {},
  epoch: 0,
  running: false,
  turn: null,
  round: 0,
  lastExit: null,
  createdAt: 1_000,
  ...over,
})

describe('groupNeedsYou', () => {
  it('names the member that asked for a decision', () => {
    const log = [entry('Design', 'Shipping this? @user', 5)]
    expect(groupNeedsYou(room({ log }))).toBe('Design')
  })

  it('clears once the user speaks again', () => {
    const log = [entry('Design', 'Shipping? @user', 5), entry('You', 'yes', 6, 'user')]
    expect(groupNeedsYou(room({ log }))).toBeNull()
  })

  it('is null when nobody asked', () => {
    expect(groupNeedsYou(room({ log: [entry('Design', 'done', 5)] }))).toBeNull()
  })

  it('ignores @username that merely starts with user', () => {
    const log = [entry('Design', 'ask @userresearch about it', 5)]
    expect(groupNeedsYou(room({ log }))).toBeNull()
  })
})

describe('groupActivityMs', () => {
  it('uses the last entry', () => {
    const log = [entry('Design', 'a', 5), entry('UX Research', 'b', 9)]
    expect(groupActivityMs(room({ log }))).toBe(9)
  })

  // §1d: a new room must sort to the top of Team before anyone has spoken.
  it('falls back to createdAt so a new room sorts to the top', () => {
    expect(groupActivityMs(room({ createdAt: 4_000 }))).toBe(4_000)
  })
})

describe('groupSubtitle', () => {
  it('names the speaker while a turn is in flight', () => {
    expect(groupSubtitle(room({ turn: 'Recruiter' }))).toBe('Recruiter is typing…')
  })

  it('prefers the live turn over a pending decision', () => {
    const log = [entry('Design', '@user which one?', 5)]
    expect(groupSubtitle(room({ log, turn: 'Growth' }))).toBe('Growth is typing…')
  })

  it('names who is blocked', () => {
    const log = [entry('Growth', 'Ready to send @user', 5)]
    expect(groupSubtitle(room({ log }))).toBe('Growth needs a yes.')
  })

  it('counts the members when nobody has spoken', () => {
    expect(groupSubtitle(room())).toBe('3 members · nobody has spoken yet')
  })

  it('otherwise shows who said what last', () => {
    const log = [entry('Design', 'I would cut the modal entirely.', 5)]
    expect(groupSubtitle(room({ log }))).toBe('Design: I would cut the modal entirely.')
  })
})

describe('toGroupRow', () => {
  it('carries the room through to a row', () => {
    const log = [entry('Design', 'done', 7)]
    expect(toGroupRow(room({ log }))).toEqual({
      id: 'r-1',
      name: 'Launch',
      members: ['UX Research', 'Design', 'Chief of Staff'],
      subtitle: 'Design: done',
      activityMs: 7,
      speaking: null,
      needsYou: null,
    })
  })
})
