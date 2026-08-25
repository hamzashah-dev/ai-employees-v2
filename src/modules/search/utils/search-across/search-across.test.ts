import { describe, expect, it, vi } from 'vitest'
import type { HermesSearchHit } from '@/modules/core/services/hermes/types'
import { HITS_PER_PROFILE, searchAcrossProfiles, type SearchFn } from '.'

const ROSTER = Array.from({ length: 12 }, (_, i) => `employee-${i}`)

/** A backend that records how many calls are in flight at once. */
function trackingSearch(hits: (profile: string) => HermesSearchHit[] = () => []): {
  search: SearchFn
  peak: () => number
} {
  let inFlight = 0
  let peak = 0

  const search: SearchFn = async (_query, profile) => {
    inFlight += 1
    peak = Math.max(peak, inFlight)
    await new Promise((resolve) => setTimeout(resolve, 1))
    inFlight -= 1
    return hits(profile)
  }

  return { search, peak: () => peak }
}

describe('searchAcrossProfiles', () => {
  it('never has more than `concurrency` calls in flight', async () => {
    const { search, peak } = trackingSearch()
    await searchAcrossProfiles(ROSTER, 'expense', search, 4)
    expect(peak()).toBe(4)
  })

  it('still searches every employee', async () => {
    const search = vi.fn<SearchFn>(async () => [])
    await searchAcrossProfiles(ROSTER, 'expense', search, 3)
    expect(search).toHaveBeenCalledTimes(ROSTER.length)
    expect(search.mock.calls.map((call) => call[1]).sort()).toEqual([...ROSTER].sort())
  })

  it('never opens more workers than there are employees', async () => {
    const { search, peak } = trackingSearch()
    await searchAcrossProfiles(['solo'], 'expense', search, 8)
    expect(peak()).toBe(1)
  })

  it('asks each profile for a bounded slice', async () => {
    const search = vi.fn<SearchFn>(async () => [])
    await searchAcrossProfiles(['solo'], 'expense', search)
    expect(search).toHaveBeenCalledWith('expense', 'solo', HITS_PER_PROFILE)
  })

  it('tags every hit with the employee it came from', async () => {
    const { search } = trackingSearch((profile) => [{ snippet: `hit from ${profile}` }])
    const hits = await searchAcrossProfiles(['a', 'b'], 'expense', search)
    expect(hits.map((hit) => hit.profile).sort()).toEqual(['a', 'b'])
  })

  it('skips a profile whose state.db throws instead of failing the batch', async () => {
    const search: SearchFn = async (_query, profile) => {
      if (profile === 'broken') throw new Error('Search failed')
      return [{ snippet: profile }]
    }
    const hits = await searchAcrossProfiles(['broken', 'fine'], 'expense', search)
    expect(hits.map((hit) => hit.profile)).toEqual(['fine'])
  })

  it('orders newest conversation first, across employees', async () => {
    const search: SearchFn = async (_query, profile) =>
      profile === 'old'
        ? [{ snippet: 'old', session_started: 1_600_000_000 }]
        : [{ snippet: 'new', session_started: 1_700_000_000 }]

    const hits = await searchAcrossProfiles(['old', 'new'], 'expense', search)
    expect(hits.map((hit) => hit.snippet)).toEqual(['new', 'old'])
  })

  it('sorts a hit with no timestamp last rather than dropping it', async () => {
    const search: SearchFn = async (_query, profile) =>
      profile === 'undated'
        ? [{ snippet: 'undated' }]
        : [{ snippet: 'dated', session_started: 1_700_000_000 }]

    const hits = await searchAcrossProfiles(['undated', 'dated'], 'expense', search)
    expect(hits.map((hit) => hit.snippet)).toEqual(['dated', 'undated'])
  })

  it('does not call the backend at all for a blank query or an empty roster', async () => {
    const search = vi.fn<SearchFn>(async () => [])
    expect(await searchAcrossProfiles(ROSTER, '   ', search)).toEqual([])
    expect(await searchAcrossProfiles([], 'expense', search)).toEqual([])
    expect(search).not.toHaveBeenCalled()
  })
})
