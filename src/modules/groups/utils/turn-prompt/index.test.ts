import { describe, expect, it } from 'vitest'
import { GROUP_PASS_TEXT } from '@/modules/core/constants/groups'
import { buildGroupTurnPrompt } from './index'

const RULES = [
  '- Reply with ONE conversational message ONLY if you have something new worth adding: build on what was just said, claim or hand off work, answer a question aimed at you, or report a real result. Keep chatter short (1-3 sentences) — but when you are delivering a result, an answer the user asked for, or substantive work, give it at full quality and length; never thin out real content to fit the room.',
  '- If you have nothing new to add, reply with exactly "(pass)". Passing is good — it lets the conversation settle.',
  '- Mention a teammate as @name to pull them in; mention @user only for a judgment call or a result the user needs. Do not repeat points already made.',
  '- Never reveal content from your private 1:1 chats. Your reply text goes to the room verbatim — no preamble, no meta-commentary.',
]

describe('buildGroupTurnPrompt', () => {
  it('lays the payload out as header, delta, rules', () => {
    const lines = buildGroupTurnPrompt({
      groupName: 'Launch',
      members: ['alice', 'bob', 'carol'],
      viewer: 'alice',
      deltaLines: ['bob: schema is up', 'carol: reviewing it'],
    }).split('\n')

    expect(lines[0]).toBe(
      '[Group chat: "Launch"] You are @alice, one participant in a group chat with @bob, @carol and the user.',
    )
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('New messages in the room since your last turn (oldest first):')
    expect(lines[3]).toBe('  bob: schema is up')
    expect(lines[4]).toBe('  carol: reviewing it')
    expect(lines[5]).toBe('')
    expect(lines[6]).toBe('Rules for this room:')
    expect(lines.slice(7)).toEqual(RULES)
  })

  it('addresses the member by handle and leaves it out of its own peer list', () => {
    const header = buildGroupTurnPrompt({
      groupName: 'Launch',
      members: ['alice', 'bob'],
      viewer: 'bob',
      deltaLines: [],
    }).split('\n')[0]

    expect(header).toContain('You are @bob,')
    expect(header).toContain('with @alice and the user')
    expect(header).not.toContain('with @bob')
  })

  it('says so plainly when the room has no one else', () => {
    const header = buildGroupTurnPrompt({
      groupName: 'Solo',
      members: ['alice'],
      viewer: 'alice',
      deltaLines: [],
    }).split('\n')[0]

    expect(header).toContain('with no one else yet and the user')
  })

  it('indents every delta line by two spaces so the transcript reads as quoted', () => {
    const prompt = buildGroupTurnPrompt({
      groupName: 'Launch',
      members: ['alice', 'bob'],
      viewer: 'alice',
      deltaLines: ['You (user): ship it', 'bob: on it'],
    })

    expect(prompt).toContain('\n  You (user): ship it\n  bob: on it\n')
  })

  it('still emits a well-formed payload with an empty delta', () => {
    const lines = buildGroupTurnPrompt({
      groupName: 'Launch',
      members: ['alice', 'bob'],
      viewer: 'alice',
      deltaLines: [],
    }).split('\n')

    expect(lines[2]).toBe('New messages in the room since your last turn (oldest first):')
    expect(lines[3]).toBe('')
    expect(lines[4]).toBe('Rules for this room:')
  })

  it('asks for the exact pass text the round loop recognises', () => {
    const prompt = buildGroupTurnPrompt({
      groupName: 'Launch',
      members: ['alice', 'bob'],
      viewer: 'alice',
      deltaLines: [],
    })

    // The loop treats a reply as silence by matching GROUP_PASS_TEXT; a prompt
    // that drifted from it would post every pass as a message.
    expect(prompt).toContain(`reply with exactly "${GROUP_PASS_TEXT}"`)
  })

  it('carries all four room rules verbatim', () => {
    const prompt = buildGroupTurnPrompt({
      groupName: 'Launch',
      members: ['alice', 'bob'],
      viewer: 'alice',
      deltaLines: ['bob: on it'],
    })

    for (const rule of RULES) {
      expect(prompt).toContain(rule)
    }
  })
})
