import { describe, expect, it } from 'vitest'
import { highlight, type HighlightSegment } from '.'

/** Compact assertion form: "before[MATCH]after". */
function render(segments: HighlightSegment[]): string {
  return segments.map((s) => (s.match ? `[${s.text}]` : s.text)).join('')
}

describe('highlight', () => {
  it('matches case-insensitively', () => {
    expect(render(highlight('Expense report filed', 'expense'))).toBe(
      '[Expense] report filed',
    )
    expect(render(highlight('expense report filed', 'EXPENSE'))).toBe(
      '[expense] report filed',
    )
  })

  it('marks every occurrence, not just the first', () => {
    expect(render(highlight('receipt, receipt, receipt', 'receipt'))).toBe(
      '[receipt], [receipt], [receipt]',
    )
  })

  it('spans a word boundary when the whole phrase is present', () => {
    expect(render(highlight('filed the expense report today', 'expense report'))).toBe(
      'filed the [expense report] today',
    )
  })

  it('falls back to the individual terms when the phrase is not present', () => {
    expect(render(highlight('the report covers every expense', 'expense report'))).toBe(
      'the [report] covers every [expense]',
    )
  })

  it('treats a query with regex metacharacters as literal text', () => {
    // A RegExp built from this unescaped throws, which is why none is built.
    expect(render(highlight('migrated to c++ (v2) today', 'c++ (v2)'))).toBe(
      'migrated to [c++ (v2)] today',
    )
    expect(() => highlight('nothing here', '*.[a-z]+(')).not.toThrow()
  })

  it('returns the line untouched when nothing matches', () => {
    expect(highlight('inbox at zero', 'kubernetes')).toEqual([
      { text: 'inbox at zero', match: false },
    ])
  })

  it('returns the line untouched for an empty query', () => {
    expect(highlight('inbox at zero', '   ')).toEqual([
      { text: 'inbox at zero', match: false },
    ])
  })

  it('handles empty text', () => {
    expect(highlight('', 'anything')).toEqual([])
  })

  /*
   * FTS5 delimits the matched terms itself; see the comment on `highlight`. These
   * are the shape `snippet(messages_fts, -1, '>>>', '<<<', '...', 40)` produces.
   */
  it('prefers FTS5 markers over re-locating the query', () => {
    expect(render(highlight('…filed the >>>expense<<< report…', 'expense'))).toBe(
      '…filed the [expense] report…',
    )
  })

  it('reads markers around a stem the raw query would never have found', () => {
    // The backend suffixes each token with `*`, so "nimb" matched "nimby".
    expect(render(highlight('a >>>nimby<<< objection', 'nimb'))).toBe(
      'a [nimby] objection',
    )
  })

  it('reads several marked terms in one snippet', () => {
    expect(render(highlight('>>>expense<<< and >>>report<<<', 'expense report'))).toBe(
      '[expense] and [report]',
    )
  })

  it('degrades an unbalanced marker to plain text rather than dropping the tail', () => {
    expect(render(highlight('truncated >>>expense', 'expense'))).toBe(
      'truncated expense',
    )
  })

  it('drops empty segments so a marker at the start adds no blank span', () => {
    expect(highlight('>>>expense<<<', 'expense')).toEqual([
      { text: 'expense', match: true },
    ])
  })

  it('merges overlapping term hits into one span', () => {
    expect(render(highlight('expenses everywhere', 'expense expenses'))).toBe(
      '[expenses] everywhere',
    )
  })

  it('ignores the FTS5 syntax a user may paste into the box', () => {
    expect(render(highlight('an exact phrase here', '"phrase"'))).toBe(
      'an exact [phrase] here',
    )
    expect(render(highlight('deployment notes', 'deploy*'))).toBe('[deploy]ment notes')
  })
})
