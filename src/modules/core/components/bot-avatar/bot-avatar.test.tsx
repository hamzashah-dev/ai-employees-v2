import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BotMark } from '.'
import { BOT_COLORS, BOT_SHAPES, BOT_SHAPE_LABELS } from './constants'
import { oklchHue, resolveBotColorHex, resolveBotPalette } from './utils/color'
import { GROUND_MIN_SIZE } from './utils/geometry'
import { layoutBlob } from './utils/blob'
import {
  AVATAR_PROPS,
  AVATAR_PROP_GLYPHS,
  AVATAR_PROP_IDS,
  isAvatarPropId,
} from '@/modules/core/constants/avatar-props'

/**
 * What is worth testing here.
 *
 * The renderer is a pure function of its props, so the valuable assertions are the ones that
 * catch a silent wrong answer rather than a crash: the **size tiers**, because a mark that
 * keeps its ground shadow at 20px degrades into a smudge and nothing throws; the
 * **vocabulary**, because it is indexed by a hash and a reorder repaints the whole product;
 * and the **blobatar contract**, because the head is drawn from an underscore-exported layout
 * and a dependency bump that changed its shape would fail silently otherwise.
 */

const markOf = (label: string) => screen.getByRole('img', { name: label })
const partsOf = (label: string, part: string) =>
  markOf(label).querySelectorAll(`[data-part="${part}"]`)
/** The body group's markup — one path for a round head, several marks for a capsule or sun. */
const bodyPath = (label: string) => partsOf(label, 'body')[0]?.innerHTML

describe('colour resolution', () => {
  it('resolves a palette name to its hex', () => {
    expect(resolveBotColorHex('grape')).toBe('#8b5cf6')
    expect(resolveBotColorHex('leaf')).toBe('#10b981')
  })

  it('passes a literal hex through, expanding shorthand', () => {
    expect(resolveBotColorHex('#123456')).toBe('#123456')
    expect(resolveBotColorHex('#ABC')).toBe('#aabbcc')
  })

  it('falls back to the default hue rather than throwing on junk', () => {
    expect(resolveBotColorHex(undefined)).toBe('#8b5cf6')
    expect(resolveBotColorHex('chartreuse' as 'grape')).toBe('#8b5cf6')
    expect(resolveBotColorHex('#nothex' as `#${string}`)).toBe('#8b5cf6')
  })
})

describe('OKLCH hue', () => {
  it('reads the perceptual hue off a saturated colour', () => {
    // The textbook OKLCH values for the sRGB primaries. Notably *not* HSL's 0/120/240 —
    // blobatar's ramps are tuned in OKLCH, and asking it in HSL lands the blues and purples
    // in the wrong family.
    expect(oklchHue('#ff0000')).toBeCloseTo(29.2, 0)
    expect(oklchHue('#00ff00')).toBeCloseTo(142.5, 0)
    expect(oklchHue('#0000ff')).toBeCloseTo(264.1, 0)
  })

  it('answers something finite for a grey, rather than NaN', () => {
    expect(Number.isFinite(oklchHue('#808080'))).toBe(true)
  })
})

describe('the bot palette', () => {
  it('derives two distinct tones from one hue', () => {
    const p = resolveBotPalette('sky')
    expect(p.head).toMatch(/^#[0-9a-f]{6}$/)
    expect(p.eye).toMatch(/^#[0-9a-f]{6}$/)
    expect(p.head).not.toBe(p.eye)
  })

  it('is deterministic, so the roster and the card agree on a colour', () => {
    expect(resolveBotPalette('leaf')).toEqual(resolveBotPalette('leaf'))
    expect(resolveBotPalette('#10b981')).toEqual(resolveBotPalette('leaf'))
  })

  it('gives every one of the eight swatches its own head tone', () => {
    const heads = new Set(BOT_COLORS.map((c) => resolveBotPalette(c.name).head))
    expect(heads.size).toBe(BOT_COLORS.length)
  })
})

describe('the exported vocabulary', () => {
  it('offers nine of blobatar’s ten silhouettes and eight colours', () => {
    // Every blobatar shape but `triangle`.
    expect(BOT_SHAPES).toEqual([
      'round',
      'organic',
      'boxy',
      'capsule',
      'nub',
      'cloud',
      'droplet',
      'hexagon',
      'sun',
    ])
    expect(BOT_COLORS).toHaveLength(8)
  })

  it('names every shape', () => {
    for (const shape of BOT_SHAPES) expect(BOT_SHAPE_LABELS[shape]).toBeTruthy()
  })

  it('keys every colour uniquely, since the key is what gets persisted', () => {
    expect(new Set(BOT_COLORS.map((c) => c.name)).size).toBe(BOT_COLORS.length)
    expect(new Set(BOT_COLORS.map((c) => c.hex)).size).toBe(BOT_COLORS.length)
  })
})

describe('the blobatar contract', () => {
  // `layoutBlob` reads blobatar's underscore-exported layout. The version is pinned exactly,
  // and this is what turns a careless bump into a red test instead of a silent drift.
  it('hands back a body, two eyes and a head ellipse inside the frame, for every shape', () => {
    for (const shape of BOT_SHAPES) {
      const { body, eyes, head } = layoutBlob('ad-creator', shape)
      // A capsule is a path plus two circles, a sun a path plus eight; a round head is one
      // path. Whatever the count, every mark must be drawable.
      expect(body.length).toBeGreaterThan(0)
      for (const mark of body) {
        if (mark.kind === 'path') expect(mark.d).toMatch(/^M/)
        else expect(mark.r).toBeGreaterThan(0)
      }
      expect(eyes).toHaveLength(2)
      for (const eye of eyes) {
        expect(eye.d).toMatch(/^M/)
        expect(Number.isFinite(eye.cx)).toBe(true)
        expect(Number.isFinite(eye.cy)).toBe(true)
      }
      for (const v of [head.cx, head.cy, head.rx, head.ry]) {
        expect(Number.isFinite(v)).toBe(true)
      }
      expect(head.cx - head.rx).toBeGreaterThan(0)
      expect(head.cx + head.rx).toBeLessThan(100)
      expect(head.cy - head.ry).toBeGreaterThan(0)
      expect(head.cy + head.ry).toBeLessThan(100)
    }
  })

  it('draws the silhouette it was asked for, not the one the seed would have picked', () => {
    // Blobatar buckets a 0–1 trait into its ten shapes; each of ours pins a value inside
    // its bucket. This is what catches the buckets moving under a dependency bump.
    for (const seed of ['ad-creator', 'code-reviewer', 'default', 'chief-of-staff', 'x']) {
      for (const shape of BOT_SHAPES) {
        expect(layoutBlob(seed, shape).shape).toBe(shape)
      }
    }
  })

  it('is deterministic per seed and differs across seeds', () => {
    expect(layoutBlob('a', 'round')).toEqual(layoutBlob('a', 'round'))
    expect(layoutBlob('a', 'round').body).not.toEqual(layoutBlob('b', 'round').body)
  })
})

describe('the prop registry', () => {
  it('carries a meaning for every prop', () => {
    for (const id of AVATAR_PROP_IDS) {
      expect(AVATAR_PROPS[id].meaning.length).toBeGreaterThan(0)
    }
  })

  it('has a monochrome glyph for every prop', () => {
    for (const id of AVATAR_PROP_IDS) {
      expect(typeof AVATAR_PROP_GLYPHS[id]).toBe('function')
    }
  })

  it('recognises its own ids and rejects anything else', () => {
    expect(isAvatarPropId('search')).toBe(true)
    expect(isAvatarPropId('not-a-prop')).toBe(false)
    expect(isAvatarPropId(undefined)).toBe(false)
    expect(isAvatarPropId(null)).toBe(false)
  })
})

describe('BotMark', () => {
  it('carries the accessible name an avatar needs', () => {
    render(<BotMark label="ad-creator avatar" />)
    expect(markOf('ad-creator avatar')).toBeInTheDocument()
  })

  it('steps out of the tree when the surrounding control is already labelled', () => {
    const { container } = render(<BotMark label={null} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws every shape, with a body and eyes', () => {
    for (const shape of BOT_SHAPES) {
      const { unmount } = render(<BotMark shape={shape} label={shape} />)
      expect(partsOf(shape, 'body')).toHaveLength(1)
      expect(bodyPath(shape)).toBeTruthy()
      expect(partsOf(shape, 'eyes')).toHaveLength(1)
      unmount()
    }
  })

  it('paints the head and eyes in the resolved palette', () => {
    const p = resolveBotPalette('leaf')
    render(<BotMark color="leaf" label="leafy" />)
    expect(partsOf('leafy', 'body')[0]).toHaveAttribute('fill', p.head)
    expect(partsOf('leafy', 'eyes')[0]).toHaveAttribute('fill', p.eye)
  })

  it('draws a different character for a different seed, and the same one twice', () => {
    render(<BotMark seed="ad-creator" label="a" />)
    render(<BotMark seed="ad-creator" label="a-again" />)
    render(<BotMark seed="code-reviewer" label="b" />)
    expect(bodyPath('a')).toBeTruthy()
    expect(bodyPath('a')).toBe(bodyPath('a-again'))
    expect(bodyPath('a')).not.toBe(bodyPath('b'))
  })

  it('changes silhouette with the shape, for the same seed', () => {
    for (const shape of BOT_SHAPES) {
      render(<BotMark seed="ad-creator" shape={shape} label={`shape-${shape}`} />)
    }
    const bodies = new Set(BOT_SHAPES.map((shape) => bodyPath(`shape-${shape}`)))
    expect(bodies.size).toBe(BOT_SHAPES.length)
  })

  it('wears the resting face by default and the working one while busy', () => {
    const { rerender } = render(<BotMark label="worker" />)
    expect(partsOf('worker', 'eyes')[0]).toHaveAttribute('data-face', 'idle')

    rerender(<BotMark label="worker" busy />)
    expect(partsOf('worker', 'eyes')[0]).toHaveAttribute('data-face', 'working')
  })
})

describe('sizing', () => {
  /*
   * The regression these guard shipped once and was invisible to every other test in this
   * file: `size` drove the detail tiers but nothing drove the box, so a caller that sized
   * purely through `size` — the identity modal's hero — rendered a zero-width avatar. Every
   * tier assertion still passed, because the parts were all present in a box of no size.
   */
  it('sizes itself from `size` alone, with no class to help it', () => {
    render(<BotMark size={72} label="hero" />)
    const svg = markOf('hero')
    expect(svg).toHaveAttribute('width', '72')
    expect(svg).toHaveAttribute('height', '72')
  })

  it('sizes itself at the default too, so a bare mark is never zero-width', () => {
    render(<BotMark label="bare" />)
    expect(Number(markOf('bare').getAttribute('width'))).toBeGreaterThan(0)
  })

  it('still lets a class win, which is how the group cluster lays its faces out', () => {
    render(<BotMark size={20} className="size-4" label="clustered" />)
    const svg = markOf('clustered')
    expect(svg).toHaveAttribute('width', '20')
    expect(svg.getAttribute('class')).toContain('size-4')
  })
})

describe('size tiers', () => {
  it('draws everything at hero size', () => {
    render(<BotMark size={96} label="hero" />)
    expect(partsOf('hero', 'ground')).toHaveLength(1)
  })

  it('drops the ground below its own threshold', () => {
    render(<BotMark size={GROUND_MIN_SIZE - 1} label="mid" />)
    expect(partsOf('mid', 'ground')).toHaveLength(0)
  })

  it('keeps the ground at exactly the threshold, not one pixel above it', () => {
    render(<BotMark size={GROUND_MIN_SIZE} label="edge" />)
    expect(partsOf('edge', 'ground')).toHaveLength(1)
  })

  it('never drops the body or the face, however small it gets', () => {
    render(<BotMark size={12} label="dot" />)
    expect(partsOf('dot', 'body')).toHaveLength(1)
    expect(partsOf('dot', 'eyes')).toHaveLength(1)
  })
})
