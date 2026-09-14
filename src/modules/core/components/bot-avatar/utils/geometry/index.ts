import type { Ellipse } from '../../types'

/** The frame every avatar is drawn in — blobatar's own, so its paths need no rescale. */
export const VIEW_BOX = 100

/**
 * Where detail leaves the mark as it shrinks.
 *
 * Driven by the rendered size rather than a media query, because one screen draws this at five
 * different sizes — a 20px presence dot and a 128px hero can sit in the same viewport. The
 * ground goes first: it is a 3-unit ellipse at 16% opacity and turns to mush long before
 * anything else does.
 */
export const GROUND_MIN_SIZE = 48

/** The ground shadow, under the body and a little narrower than it. */
export function groundEllipse(head: Ellipse): Ellipse & { opacity: number } {
  return { cx: head.cx, cy: 93, rx: head.rx * 0.78, ry: 2.8, opacity: 0.16 }
}
