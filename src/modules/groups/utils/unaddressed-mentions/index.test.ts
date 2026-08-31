import { describe, expect, it } from 'vitest'
import type { GroupMessage } from '@/modules/core/types/groups'
import { unaddressedGroupMentions } from './index'

const ROSTER = ['alice', 'bob', 'carol']

let seq = 0

function member(name: string, text: string, thread = 't1'): GroupMessage {
  seq += 1

  return { id: `e${seq}`, at: seq, from: { kind: 'member', name }, text, thread }
}

function user(text: string, thread = 't1'): GroupMessage {
  seq += 1

  return { id: `e${seq}`, at: seq, from: { kind: 'user', name: 'You' }, text, thread }
}

describe('unaddressedGroupMentions', () => {
  it('has nothing pending in an empty room', () => {
    expect(unaddressedGroupMentions([], ROSTER, 't1')).toEqual([])
  })

  it('clears a handoff once the cited member takes a turn', () => {
    const log = [member('alice', '@bob can you take the schema?'), member('bob', 'on it')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual([])
  })

  it('counts a pass as an answer', () => {
    // Any turn resolves the handoff — the member was asked and responded.
    const log = [member('alice', '@bob thoughts?'), member('bob', 'nothing to add')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual([])
  })

  it('reports a member called on but never heard from', () => {
    const log = [user('who owns the schema?'), member('alice', '@bob can you take the schema?')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual(['bob'])
  })

  it('ignores a member citing itself', () => {
    const log = [member('alice', 'noting for later: @alice owns the schema')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual([])
  })

  it('ignores a mention the user wrote', () => {
    // The send that carried it re-drives the whole roster on its own, so bob is
    // already scheduled; buying it a continuation would double the turn.
    const log = [user('@bob can you take the schema?')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual([])
  })

  it('still reports a member whose only turn came BEFORE it was cited', () => {
    // The bug this guards: treating "has posted at all" as an answer, which
    // strands every handoff to a member that already spoke this thread.
    const log = [member('bob', 'morning'), member('alice', '@bob can you take the schema?')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual(['bob'])
  })

  it('re-opens a handoff when the member is cited again after answering', () => {
    const log = [
      member('alice', '@bob can you take the schema?'),
      member('bob', 'on it'),
      member('alice', '@bob and the migration too?'),
    ]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual(['bob'])
  })

  it('does not let an answer in another thread resolve this thread', () => {
    const log = [member('alice', '@bob can you take the schema?', 't1'), member('bob', 'on it', 't2')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual(['bob'])
  })

  it('does not let a citation in another thread leak in', () => {
    const log = [member('alice', '@bob can you take the schema?', 't1'), member('carol', 'quiet here', 't2')]

    expect(unaddressedGroupMentions(log, ROSTER, 't2')).toEqual([])
  })

  it('reports every member still owed a turn', () => {
    const log = [member('alice', '@bob and @carol, split this?')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1').sort()).toEqual(['bob', 'carol'])
  })

  it('reports only the member that has not answered', () => {
    const log = [member('alice', '@bob and @carol, split this?'), member('carol', 'taking the migration')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual(['bob'])
  })

  it('follows a chain of handoffs to whoever is currently owed a turn', () => {
    const log = [
      member('alice', '@bob can you take the schema?'),
      member('bob', 'done — @carol can you review it?'),
    ]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual(['carol'])
  })

  it('ignores a handle that resolves to nobody on the roster', () => {
    const log = [member('alice', '@dave can you take the schema?')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual([])
  })

  it('does not treat @everyone as a handoff to anyone in particular', () => {
    // A broadcast is the round loop's default responder set already; stranding
    // the whole roster on it would make every quiet room buy a continuation.
    const log = [member('alice', '@everyone thoughts?')]

    expect(unaddressedGroupMentions(log, ROSTER, 't1')).toEqual([])
  })

  it('resolves a mention written in a different separator form', () => {
    const roster = ['alice', 'data-analyst']
    const log = [member('alice', '@data_analyst can you take the schema?')]

    expect(unaddressedGroupMentions(log, roster, 't1')).toEqual(['data-analyst'])
  })
})
