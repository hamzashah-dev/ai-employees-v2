/**
 * Locating the query inside a result line so it can be drawn in `content-primary`
 * against `content-secondary` surroundings (D10).
 *
 * Two sources of truth, in order:
 *
 * 1. **FTS5's own markers.** The contract for this pass says the snippet is plain
 *    text with no markup. That is not quite right, and the difference is visible:
 *    `computer_state.py` builds the column as
 *    `snippet(messages_fts, -1, '>>>', '<<<', '...', 40)` (three call sites — the
 *    ASCII, CJK and trigram tables), and `web_server.py` passes `m["snippet"]`
 *    through untouched. So most message hits arrive already delimited, and a UI
 *    that ignores the markers renders a literal `>>>expense<<<` on the row. They
 *    are also *better* than anything we can recompute, because FTS matched stems
 *    and prefixes (`nimb*` → `nimby`) that a client-side substring scan cannot.
 *
 * 2. **A client-side scan**, for the lines that carry no markers: the direct
 *    session-id hits (whose snippet is the session preview, or a synthesised
 *    `Session ID: …`), the LIKE fallback path (a bare `substr()` window), and the
 *    employee rows, which never touch the backend at all.
 *
 * Deliberately no `RegExp`. Escaping user input for one is easy to forget and the
 * failure is a thrown `SyntaxError` on a query as ordinary as `c++ (v2)`, mid
 * keystroke, inside a render. `indexOf` cannot fail that way and needs no escape
 * step, which is the whole reason to prefer it here.
 */

export interface HighlightSegment {
  text: string
  /** True for the span that matched, which the row draws in `content-primary`. */
  match: boolean
}

const OPEN = '>>>'
const CLOSE = '<<<'

type Range = readonly [start: number, end: number]

export function highlight(text: string, query: string): HighlightSegment[] {
  if (!text) return []
  if (text.includes(OPEN)) return fromMarkers(text)

  const ranges = locate(text, query)
  return ranges.length > 0 ? fromRanges(text, ranges) : [{ text, match: false }]
}

/** Split on FTS5's delimiters. An unbalanced marker degrades to plain text. */
function fromMarkers(text: string): HighlightSegment[] {
  const segments: HighlightSegment[] = []
  const push = (value: string, match: boolean): void => {
    if (value) segments.push({ text: value, match })
  }

  let rest = text
  while (rest) {
    const open = rest.indexOf(OPEN)
    if (open < 0) {
      push(rest, false)
      break
    }
    push(rest.slice(0, open), false)

    const after = rest.slice(open + OPEN.length)
    const close = after.indexOf(CLOSE)
    if (close < 0) {
      push(after, false)
      break
    }
    push(after.slice(0, close), true)
    rest = after.slice(close + CLOSE.length)
  }

  return segments
}

/**
 * The whole query first, so a multi-word query highlights as one span across the
 * word boundary rather than as two disconnected words. Only when the phrase is
 * absent does it fall back to the individual terms — which is also what the
 * backend did, since `search_sessions` splits the query and suffixes each token
 * with `*` before handing it to FTS.
 */
function locate(text: string, query: string): Range[] {
  const needle = query.trim()
  if (!needle) return []

  const phrase = occurrences(text, needle)
  if (phrase.length > 0) return phrase

  const terms = needle.split(/\s+/).map(bareTerm).filter(Boolean)
  return merge(terms.flatMap((term) => occurrences(text, term)))
}

/** `"quoted phrase"` and `prefix*` are FTS5 syntax, not part of the text to find. */
function bareTerm(term: string): string {
  return term.replace(/^"+|"+$/g, '').replace(/\*+$/, '')
}

/**
 * Case-insensitive substring positions.
 *
 * Known ceiling: index alignment assumes `toLowerCase()` preserves length, which a
 * handful of code points (Turkish dotted capital I) break. The cost of being wrong
 * is a highlight span off by a character on those inputs, not a crash — cheap
 * enough that a locale-aware collator scan is not worth its cost per keystroke.
 */
function occurrences(text: string, needle: string): Range[] {
  const haystack = text.toLowerCase()
  const lower = needle.toLowerCase()
  if (!lower) return []

  const found: Range[] = []
  let from = 0
  for (;;) {
    const at = haystack.indexOf(lower, from)
    if (at < 0) return found
    found.push([at, at + lower.length])
    from = at + lower.length
  }
}

/** Overlapping term hits ("ex" and "expense") become one span, not two nested ones. */
function merge(ranges: Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const merged: Range[] = []

  for (const range of sorted) {
    const last = merged[merged.length - 1]
    if (last && range[0] <= last[1]) {
      merged[merged.length - 1] = [last[0], Math.max(last[1], range[1])]
    } else {
      merged.push(range)
    }
  }

  return merged
}

function fromRanges(text: string, ranges: Range[]): HighlightSegment[] {
  const segments: HighlightSegment[] = []
  let cursor = 0

  for (const [start, end] of ranges) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false })
    segments.push({ text: text.slice(start, end), match: true })
    cursor = end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false })

  return segments
}
