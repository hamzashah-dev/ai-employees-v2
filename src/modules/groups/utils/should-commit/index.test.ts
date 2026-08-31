import { describe, expect, it } from 'vitest'
import { shouldCommitMemberTurn } from './index'

describe('shouldCommitMemberTurn', () => {
  it('commits when the epoch is unchanged', () => {
    expect(shouldCommitMemberTurn(4, 4, false)).toBe(true)
    expect(shouldCommitMemberTurn(4, 4, true)).toBe(true)
  })

  it('drops a superseded turn when the user sent again in this thread', () => {
    // The new send's own loop re-drives this member with the full delta, so
    // committing here is the double-post.
    expect(shouldCommitMemberTurn(4, 5, true)).toBe(false)
  })

  it('commits a superseded turn when the newer send was in another thread', () => {
    // Nothing will regenerate this reply — dropping it loses finished work.
    expect(shouldCommitMemberTurn(4, 5, false)).toBe(true)
  })

  it('drops by default when the caller cannot tell', () => {
    expect(shouldCommitMemberTurn(4, 5)).toBe(false)
  })

  it('treats any epoch mismatch as superseded, in either direction', () => {
    expect(shouldCommitMemberTurn(9, 2, true)).toBe(false)
    expect(shouldCommitMemberTurn(9, 2, false)).toBe(true)
  })

  it('commits at epoch zero', () => {
    expect(shouldCommitMemberTurn(0, 0, true)).toBe(true)
  })
})
