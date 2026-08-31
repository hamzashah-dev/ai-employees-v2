import type { ReactElement } from 'react'
import type { BotEyeStyle, BotShape } from '../../types'

/**
 * The mark's geometry, in one place because two coordinate systems meet here.
 *
 * Bodies are authored on a **34-unit grid** — they are the prototype's own icon paths, kept
 * rather than re-derived so a silhouette reads the same everywhere it has ever been drawn.
 * Props are authored on a **48-unit grid**, because they arrive that way from
 * `flat-color-icons`. Both are placed into a 64-unit frame by a transform rather than being
 * rescaled by hand, so neither set has to be touched again.
 *
 * These are JSX rather than markup strings, and that is not incidental. Injecting them with
 * `dangerouslySetInnerHTML` would push them through `innerHTML` on an SVG element, which jsdom
 * parses into the HTML namespace — the nodes exist but are not `SVGElement`s, so every
 * assertion about a body or a face would quietly test nothing. Only the vendored prop bodies
 * are injected, and the renderer marks them with a `data-prop` attribute so tests have
 * something namespace-independent to assert on.
 */

/** The frame every avatar is drawn in. */
export const VIEW_BOX = 64

/** 34-unit body grid → the 64-unit frame, centred at (30, 29). */
export const BODY_TRANSFORM = 'translate(0.8,-0.3) scale(1.72)'

/** 48-unit prop grid → a 30-unit box at the body's lower right. */
export const PROP_TRANSFORM = 'translate(32.5,31.5) scale(0.625)'

/**
 * Where detail leaves the mark as it shrinks.
 *
 * Driven by the rendered size rather than a media query, because one screen draws this at five
 * different sizes — a 20px presence dot and a 128px hero can sit in the same viewport.
 *
 * The ground goes first: it is a 3-unit ellipse at 16% opacity and turns to mush long before
 * anything else does. The prop goes next, at the point where a 30-unit glyph is under ~13
 * device pixels and reads as a smudge rather than an object. Below that the mark is a body and
 * a face, which is all a presence dot ever needed to be.
 */
export const GROUND_MIN_SIZE = 48
export const PROP_MIN_SIZE = 28

export const BODY_PATHS: Record<BotShape, ReactElement> = {
  round: <circle cx="17" cy="17" r="13" />,
  blob: <path d="M17 4c7 0 14 5 13 13 -1 8 -6 13 -13 13 -8 0 -13 -6 -13 -13C4 9 10 4 17 4z" />,
  squircle: <rect x="4" y="4" width="26" height="26" rx="10" />,
  hex: <path d="M17 3 L29 10 V24 L17 31 L5 24 V10 Z" />,
  cloud: <path d="M9 27 a6.5 6.5 0 0 1 1-13 a8.5 8.5 0 0 1 15.5-1 a6 6 0 0 1 1 14z" />,
  arch: (
    <path d="M17 3.5 Q19.4 3.5 20.7 6.4 L28.6 22.6 Q31.4 30 23.8 30 H10.2 Q2.6 30 5.4 22.6 L13.3 6.4 Q14.6 3.5 17 3.5z" />
  ),
}

/**
 * The faces, on the body's own 34-unit grid so they ride its transform.
 *
 * `happy` strokes rather than fills, which is why the renderer sets both `fill` and `color` on
 * the wrapping group — the arcs take `currentColor`, so one wrapper serves every style without
 * the renderer having to know which of them draws how.
 *
 * `working` is the resting capsule at roughly half height. It reads as a squint rather than a
 * different character, which is what keeps a busy employee recognisably the same employee.
 */
export const EYE_PATHS: Record<BotEyeStyle, ReactElement> = {
  glow: (
    <>
      <rect x="11.6" y="12.4" width="3.6" height="9.2" rx="1.8" />
      <rect x="18.8" y="12.4" width="3.6" height="9.2" rx="1.8" />
    </>
  ),
  visor: (
    <>
      <ellipse cx="13.4" cy="17" rx="3.5" ry="2.4" />
      <ellipse cx="20.6" cy="17" rx="3.5" ry="2.4" />
    </>
  ),
  happy: (
    <>
      <path
        d="M9.9 19.4a3.4 3.4 0 0 1 6.8 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M17.3 19.4a3.4 3.4 0 0 1 6.8 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
    </>
  ),
  sleepy: (
    <>
      <rect x="9.6" y="15.6" width="7.2" height="3" rx="1.5" transform="rotate(-10 13.2 17.1)" />
      <rect x="17.2" y="15.6" width="7.2" height="3" rx="1.5" transform="rotate(10 20.8 17.1)" />
    </>
  ),
  working: (
    <>
      <rect x="11.6" y="14.6" width="3.6" height="4.8" rx="1.8" />
      <rect x="18.8" y="14.6" width="3.6" height="4.8" rx="1.8" />
    </>
  ),
}

/** The ground shadow, in frame coordinates — it sits under the body, not inside its grid. */
export const GROUND_ELLIPSE = { cx: 30, cy: 56.6, rx: 19, ry: 3.2, opacity: 0.16 } as const
