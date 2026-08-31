import { describe, expect, it } from 'vitest'
import { GROUP_PASS_TEXT } from '@/modules/core/constants/groups'
import { isGroupPassText } from './index'

describe('isGroupPassText', () => {
  it('accepts the exact text members are told to send', () => {
    expect(isGroupPassText(GROUP_PASS_TEXT)).toBe(true)
  })

  it('accepts every spelling of a pass', () => {
    for (const text of [
      'pass',
      'Pass',
      'PASS',
      'pass.',
      'Pass.',
      '(pass)',
      '(pass).',
      '( pass )',
      '  (PASS) ',
      '\n(pass)\n',
      'pass)',
      '(pass',
    ]) {
      expect(isGroupPassText(text), text).toBe(true)
    }
  })

  it('treats an empty or absent reply as silence', () => {
    for (const text of ['', '   ', '\n\t', null, undefined]) {
      expect(isGroupPassText(text)).toBe(true)
    }
  })

  it('rejects a reply that merely contains the word', () => {
    for (const text of [
      'passable',
      'pass the salt',
      'I pass',
      'pass!',
      'no comment',
      'passing',
      '(passes)',
    ]) {
      expect(isGroupPassText(text), text).toBe(false)
    }
  })
})
