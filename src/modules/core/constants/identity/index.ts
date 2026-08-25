/**
 * The six employee hues, taken from the design canvas.
 *
 * These are decorative brand hues rather than semantic roles — an avatar's colour carries
 * no meaning — so they are a local constant rather than `--color-*` tokens. Four of the six
 * land on existing ramp steps and are referenced as such; cyan and purple have no step in
 * this app's ramps (its `primary` ramp is Chatly blue) so they carry the canvas value.
 *
 * Deliberately excludes the status greens/ambers/reds *as status* — `success-50` and
 * `error-50` appear here as identity hues, so nothing may infer state from an avatar.
 */
export const IDENTITY_COLORS = [
  'rgb(var(--primary-60))', //  #0088FF
  'rgb(0 199 234)', //          #00C7EA — no ramp step
  'rgb(var(--warning-30))', //  #F1C21B
  'rgb(138 63 252)', //         #8A3FFC — Imagine purple, no ramp step
  'rgb(var(--success-50))', //  #24A148
  'rgb(var(--error-50))', //    #FA4D56
] as const

/**
 * The canvas draws two avatar treatments from the same identity: a plain circle wherever an
 * employee appears in a list, thread or card, and a large organic blob on marketplace cards.
 * The four blob silhouettes are design-original assets; the names map to the canvas's
 * `blob-a`…`blob-d` symbols.
 */
export type MascotShape = 'blob' | 'drop' | 'triangle' | 'cloud'

export const MASCOT_SHAPES: readonly MascotShape[] = [
  'blob',
  'drop',
  'triangle',
  'cloud',
]

/** `blob-a`…`blob-d`, on the canvas's 120×120 grid. */
export const MASCOT_PATHS: Record<MascotShape, string> = {
  blob: 'M60 8c28 0 48 18 48 46 0 30-16 58-48 58S12 84 12 54C12 26 32 8 60 8Z',
  drop: 'M60 6C78 28 104 44 104 72c0 26-20 42-44 42S16 98 16 72C16 44 42 28 60 6Z',
  cloud:
    'M34 108C18 108 8 96 8 82c0-12 8-22 19-25C29 40 43 26 60 26s31 14 33 31c11 3 19 13 19 25 0 14-10 26-26 26H34Z',
  triangle:
    'M60 10c6 0 10 4 14 11l34 58c6 11-1 25-14 25H26c-13 0-20-14-14-25l34-58c4-7 8-11 14-11Z',
}

/**
 * Eye placement per silhouette, from the canvas. Each blob sits its eyes at a different
 * height because the shapes have their mass in different places.
 */
export const MASCOT_EYES: Record<MascotShape, { left: number; right: number; y: number }> = {
  blob: { left: 46, right: 74, y: 56 },
  drop: { left: 47, right: 73, y: 72 },
  cloud: { left: 47, right: 73, y: 70 },
  triangle: { left: 48, right: 72, y: 76 },
}
