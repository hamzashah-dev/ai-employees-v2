import { describe, expect, it, beforeEach } from 'vitest'
import {
  setIdentityOverride,
  useIdentityStore,
} from '../stores/identity-store'
import { MASCOT_SHAPES, type MascotShape } from '../constants/identity'
import { getIdentity, toDisplayName, toInitials } from './identity'
import { formatElapsed, formatRosterTime, toDate } from './time'

describe('identity', () => {
  beforeEach(() => {
    localStorage.clear()
    useIdentityStore.setState({ overrides: {} })
  })

  it('is stable for the same profile', () => {
    expect(getIdentity('ad-creator')).toEqual(getIdentity('ad-creator'))
  })

  it('gives one profile one shape everywhere it is asked', () => {
    // The bug this guards: a marketplace card and a roster row asking for the same
    // employee and getting two different characters back.
    const shapes = new Set(Array.from({ length: 5 }, () => getIdentity('inbox-triage').shape))
    expect(shapes.size).toBe(1)
  })

  it('reaches most of the silhouettes across the catalog', () => {
    // Every shipped catalog id, so this fails if the hash ever collapses onto a subset
    // and most of the shelf starts looking identical. Not *all eight*: with 22 names and
    // eight shapes an even split is not something a hash owes anyone, and asserting one
    // would be asserting a coincidence.
    const shapes = new Set(
      [
        'inbox-triage',
        'chief-of-staff',
        'bug-hunter',
        'on-call-buddy',
        'talent-scout',
        'account-manager',
        'shorts-maker',
        'script-writer',
        'field-researcher',
        'competitor-watch',
        'cover-artist',
        'brand-keeper',
        'home-keeper',
        'expense-clerk',
        'invoice-chaser',
        'training-partner',
        'meeting-notes',
        'reply-drafter',
        'study-coach',
        'access-auditor',
        'launch-planner',
        'seo-editor',
      ].map((id) => getIdentity(id).shape),
    )
    for (const shape of shapes) expect(MASCOT_SHAPES).toContain(shape)
    expect(shapes.size).toBeGreaterThanOrEqual(6)
  })

  it('hashes the name Hermes will store, not the name it was given', () => {
    // `normalize_profile_name` in computer_cli/profiles.py is `name.strip().lower()`, so a
    // profile installed as ' Inbox-Triage ' comes back from GET /api/profiles as
    // 'inbox-triage'. Both must land on the same character.
    expect(getIdentity(' Inbox-Triage ')).toEqual(getIdentity('inbox-triage'))
    expect(getIdentity('DEFAULT').shape).toBe(getIdentity('default').shape)
  })

  it('keys an override by the normalised name too', () => {
    setIdentityOverride(' Inbox-Triage ', { shape: 'hex' })
    expect(getIdentity('inbox-triage', override('inbox-triage')).shape).toBe('hex')
  })

  it('ignores a shape this build no longer draws', () => {
    // `triangle` was in the four-silhouette vocabulary and is still sitting in the
    // localStorage of anyone who picked it. Falling back to the derived shape beats
    // rendering nothing, and beats silently rewriting the user's stored choice.
    const derived = getIdentity('ad-creator').shape
    setIdentityOverride('ad-creator', { shape: 'triangle' as MascotShape })
    expect(getIdentity('ad-creator', override('ad-creator')).shape).toBe(derived)
  })

  it('separates different profiles', () => {
    const names = ['ad-creator', 'inbox-manager', 'sales-outbound', 'talent-scout']
    const colors = new Set(names.map((n) => getIdentity(n).color))
    // Not a guarantee of zero collisions, but a hash that maps four distinct
    // names to one colour would be broken.
    expect(colors.size).toBeGreaterThan(1)
  })

  it('honours a stored override', () => {
    const before = getIdentity('ad-creator')
    setIdentityOverride('ad-creator', { colorIndex: 3, shape: 'cloud' })
    const after = getIdentity('ad-creator', override('ad-creator'))

    expect(after.shape).toBe('cloud')
    expect(after.color).not.toBe(before.color)
  })

  it('survives a reload, because the override is the only place a rename lives', () => {
    // Hermes stores no display name, so losing this loses the rename outright.
    setIdentityOverride('ad-creator', { title: 'Ad Studio', colorIndex: 2 })
    expect(JSON.parse(localStorage.getItem('employees:identity-overrides') ?? '{}')).toEqual({
      'ad-creator': { colorIndex: 2, title: 'Ad Studio' },
    })
  })

  it('forgets an override rather than storing an empty one', () => {
    setIdentityOverride('ad-creator', { title: 'Ad Studio' })
    setIdentityOverride('ad-creator', { title: '   ' })

    expect(override('ad-creator')).toBeUndefined()
    expect(toDisplayName('ad-creator', override('ad-creator'))).toBe('Ad Creator')
  })

  it('derives initials from slug words', () => {
    expect(toInitials('ad-creator')).toBe('AC')
    expect(toInitials('chief')).toBe('CH')
    expect(toInitials('sales_outbound')).toBe('SO')
    expect(toInitials('')).toBe('?')
  })

  it('humanises profile slugs', () => {
    expect(toDisplayName('ad-creator')).toBe('Ad Creator')
    expect(toDisplayName('startup-kit-agent')).toBe('Startup Kit Agent')
    expect(toDisplayName('chief')).toBe('Chief')
  })

  it('prefers the user\u2019s name over the slug, but only a real one', () => {
    expect(toDisplayName('ad-creator', { title: 'Ad Studio' })).toBe('Ad Studio')
    expect(toDisplayName('ad-creator', { title: '  ' })).toBe('Ad Creator')
    expect(toDisplayName('ad-creator', { colorIndex: 1 })).toBe('Ad Creator')
  })
})

/** The store keys by the normalised name; reading it back has to use the same key. */
const override = (profile: string) =>
  useIdentityStore.getState().overrides[profile.trim().toLowerCase()]

describe('time', () => {
  it('reads epoch seconds and milliseconds alike', () => {
    // Hermes writes seconds in some session rows and ms in others.
    const seconds = toDate(1_700_000_000)
    const millis = toDate(1_700_000_000_000)
    expect(seconds?.getTime()).toBe(millis?.getTime())
  })

  it('parses ISO strings', () => {
    expect(toDate('2026-08-25T10:00:00Z')?.getUTCFullYear()).toBe(2026)
  })

  it('returns null for junk', () => {
    expect(toDate(null)).toBeNull()
    expect(toDate('not a date')).toBeNull()
  })

  it('labels yesterday rather than a time', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatRosterTime(yesterday.toISOString())).toBe('Yesterday')
  })

  it('shows a time for today', () => {
    expect(formatRosterTime(new Date().toISOString())).toMatch(/\d/)
  })

  it('formats the working timer as hh:mm:ss', () => {
    const start = 1_000_000
    expect(formatElapsed(start, start + 761_000)).toBe('00:12:41')
    expect(formatElapsed(start, start)).toBe('00:00:00')
    expect(formatElapsed(start, start + 3_661_000)).toBe('01:01:01')
  })

  it('never shows a negative elapsed time', () => {
    expect(formatElapsed(2_000, 1_000)).toBe('00:00:00')
  })
})
