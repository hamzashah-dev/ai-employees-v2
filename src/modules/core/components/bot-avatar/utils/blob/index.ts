import { _layout, _posed } from 'blobatar/internal'
import type { BlobMark, BotShape, Ellipse } from '../../types'

/**
 * The head, as blobatar lays it out.
 *
 * Blobatar's public surface is a rendered `<svg>` string. This app wants the *parts* — the
 * body marks, the eye paths and the head's bounding ellipse — so it can draw them itself in
 * JSX (no `innerHTML`, so jsdom sees real elements) and squint the eyes while a turn is in
 * flight. Those come from `blobatar/internal`, whose underscore names are the library saying
 * "this can move". The version is pinned exactly and `bot-avatar.test.tsx` asserts the shape
 * of what comes back, so a bump that moves it fails a test rather than drifting silently.
 */

/**
 * Where on blobatar's shape axis each of our silhouettes lives.
 *
 * The axis is a 0–1 trait bucketed by cumulative weight (`styles/blob.ts` in the package):
 * round to .22, organic to .48, boxy to .6, capsule to .7, nub to .79, cloud to .86, droplet
 * to .915, hexagon to .95, sun to .98, triangle to 1. Each pin is the middle of its bucket;
 * the test that every seed comes back as the requested shape is what would catch the buckets
 * moving.
 */
const SHAPE_TRAIT: Record<BotShape, number> = {
  round: 0.11,
  organic: 0.35,
  boxy: 0.54,
  capsule: 0.65,
  nub: 0.745,
  cloud: 0.825,
  droplet: 0.888,
  hexagon: 0.932,
  sun: 0.965,
}

export interface BlobEye {
  d: string
  cx: number
  cy: number
}

export interface BlobLayout {
  /** The blobatar shape name that was actually drawn. */
  shape: string
  /**
   * The body, in draw order. One path for a round head; a path plus circles for a capsule
   * (two end caps), a nub (one bump), a cloud or a sun (its petals).
   */
  body: BlobMark[]
  eyes: BlobEye[]
  /** The head's core bounding ellipse, in blobatar's own 100-unit frame. */
  head: Ellipse
}

export function layoutBlob(seed: string, shape: BotShape): BlobLayout {
  const opts = { traits: { shape: SHAPE_TRAIT[shape] }, background: false as const }
  const layout = _layout(seed, opts)
  const posed = _posed(seed, opts)
  const { cx, cy, rx, ry } = layout.body

  return {
    shape: layout.shape,
    body: posed.marks.map((mark) =>
      mark.kind === 'path'
        ? { kind: 'path', d: mark.d }
        : { kind: 'circle', cx: mark.cx, cy: mark.cy, r: mark.r },
    ),
    eyes: posed.eyes.map((eye, i) => ({
      d: eye.d,
      cx: layout.eyes[i]?.cx ?? cx,
      cy: layout.eyes[i]?.cy ?? cy,
    })),
    head: { cx, cy, rx, ry },
  }
}
