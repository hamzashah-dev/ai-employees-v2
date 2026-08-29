import { describe, expect, it } from 'vitest'
import type { ProfileEnvKey } from '@/modules/core/services/hermes/rest'
import type { AgentRequirement } from '../../../../constants/catalog'
import {
  firstOutstanding,
  progressLabel,
  summariseRequirements,
} from '.'

/**
 * A key-store row with only the two fields this summary reads.
 *
 * `ProfileEnvKey` carries the Vaults page's fields too — masked value, origin, tools — and
 * spelling those out in every fixture would say that this function depends on them.
 */
const key = (isSet: boolean, isPassword: boolean): ProfileEnvKey => ({
  isSet,
  isPassword,
  redactedValue: null,
  description: '',
  category: '',
  providerLabel: '',
  tools: [],
  channelManaged: false,
  custom: false,
})

const REQUIREMENTS: AgentRequirement[] = [
  {
    name: 'Gmail account',
    why: 'Receipts arrive as mail.',
    satisfiedBy: 'connector',
    connector: 'gmail',
  },
  { name: 'SLACK_BOT_TOKEN', why: 'Lets it ask you.', satisfiedBy: 'value' },
  { name: 'EXPENSE_SHEET_ID', why: 'Where it writes.', satisfiedBy: 'value' },
]

describe('summariseRequirements', () => {
  it('treats every value row as outstanding before there is an employee', () => {
    const summary = summariseRequirements(REQUIREMENTS, undefined)

    expect(summary.rows.map((row) => row.state)).toEqual([
      'uncheckable',
      'outstanding',
      'outstanding',
    ])
    expect(summary.checkable).toBe(2)
    expect(summary.answered).toBe(0)
  })

  it('never reports held until the key store has actually been read', () => {
    expect(summariseRequirements(REQUIREMENTS, undefined).held).toBe(false)
  })

  it('reads satisfied straight off the key store', () => {
    const summary = summariseRequirements(REQUIREMENTS, {
      SLACK_BOT_TOKEN: key(true, true),
      EXPENSE_SHEET_ID: key(false, false),
    })

    expect(summary.answered).toBe(1)
    expect(summary.held).toBe(true)
    expect(progressLabel(summary)).toBe('1 of 2 answered')
    expect(firstOutstanding(summary)?.requirement.name).toBe('EXPENSE_SHEET_ID')
  })

  it('carries Hermes’ own is_password rather than guessing from the name', () => {
    const summary = summariseRequirements(REQUIREMENTS, {
      SLACK_BOT_TOKEN: key(false, true),
    })

    expect(summary.rows[1]?.isPassword).toBe(true)
    expect(summary.rows[2]?.isPassword).toBe(false)
  })

  it('clears held once every checkable row is answered, ignoring the connector', () => {
    const summary = summariseRequirements(REQUIREMENTS, {
      SLACK_BOT_TOKEN: key(true, true),
      EXPENSE_SHEET_ID: key(true, false),
    })

    expect(summary.held).toBe(false)
    expect(progressLabel(summary)).toBe('2 of 2 answered')
    expect(firstOutstanding(summary)).toBeUndefined()
  })

  it('holds nothing for an agent whose needs are all connectors', () => {
    const connectorsOnly = REQUIREMENTS.slice(0, 1)
    const summary = summariseRequirements(connectorsOnly, {})

    expect(summary.checkable).toBe(0)
    expect(summary.held).toBe(false)
    expect(progressLabel(summary)).toBeUndefined()
  })

  it('survives an agent with no declared requirements at all', () => {
    const summary = summariseRequirements(undefined, {})

    expect(summary.rows).toEqual([])
    expect(summary.held).toBe(false)
  })
})
