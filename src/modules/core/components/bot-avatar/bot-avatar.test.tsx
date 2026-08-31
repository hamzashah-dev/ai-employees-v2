import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BotMark } from '.'
import {
  BOT_COLORS,
  BOT_EYE_STYLES,
  BOT_EYE_STYLE_LABELS,
  BOT_SHAPES,
  BOT_SHAPE_LABELS,
  DEFAULT_BOT_EYE_STYLE,
} from './constants'
import { hueOf, hueSeparation, resolveBotColorHex } from './utils/color'
import { GROUND_MIN_SIZE, PROP_MIN_SIZE } from './utils/geometry'
import {
  AVATAR_PROPS,
  AVATAR_PROP_IDS,
  MIN_PROP_HUE_SEPARATION,
  PROP_HUE,
  isAvatarPropId,
} from '@/modules/core/constants/avatar-props'

/**
 * What is worth testing here, now that there is no WebGL to stand in for.
 *
 * The renderer is a pure function of its props, so the valuable assertions are the ones that
 * catch a silent wrong answer rather than a crash: the **size tiers**, because a mark that
 * keeps its prop at 20px degrades into a smudge and nothing throws; the **vocabulary**, because
 * it is indexed by a hash and a reorder repaints the whole product; and the **prop registry**,
 * because a missing hue entry would quietly disable the collision solver for that glyph.
 *
 * Assertions about the prop go through `data-prop` rather than the injected markup. jsdom
 * parses SVG `innerHTML` into the HTML namespace, so querying the vendored paths would be
 * asserting on nodes the browser would never produce.
 */

const markOf = (label: string) => screen.getByRole('img', { name: label })
const partsOf = (label: string, part: string) =>
  markOf(label).querySelectorAll(`[data-part="${part}"]`)

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

describe('hue arithmetic', () => {
  it('reads a hue off a saturated colour', () => {
    expect(hueOf('#ff0000')).toBeCloseTo(0)
    expect(hueOf('#00ff00')).toBeCloseTo(120)
    expect(hueOf('#0000ff')).toBeCloseTo(240)
  })

  it('reports no hue for a grey, so the solver does not route around nothing', () => {
    expect(hueOf('#808080')).toBeNull()
    expect(hueOf('#ffffff')).toBeNull()
    expect(hueOf('#000000')).toBeNull()
  })

  it('measures the short way round the wheel', () => {
    expect(hueSeparation(10, 350)).toBe(20)
    expect(hueSeparation(0, 180)).toBe(180)
    expect(hueSeparation(90, 90)).toBe(0)
  })

  it('never exceeds half the wheel, whichever order it is asked in', () => {
    for (let a = 0; a < 360; a += 17) {
      for (let b = 0; b < 360; b += 23) {
        const d = hueSeparation(a, b)
        expect(d).toBeGreaterThanOrEqual(0)
        expect(d).toBeLessThanOrEqual(180)
        expect(hueSeparation(b, a)).toBe(d)
      }
    }
  })
})

describe('the exported vocabulary', () => {
  it('offers six shapes, four pickable eye styles and eight colours', () => {
    expect(BOT_SHAPES).toHaveLength(6)
    expect(BOT_EYE_STYLES).toHaveLength(4)
    expect(BOT_COLORS).toHaveLength(8)
  })

  it('keeps `working` out of the picker while still being drawable', () => {
    expect(BOT_EYE_STYLES).not.toContain('working')
    expect(BOT_EYE_STYLE_LABELS.working).toBeTruthy()
  })

  it('names every shape and eye style', () => {
    for (const shape of BOT_SHAPES) expect(BOT_SHAPE_LABELS[shape]).toBeTruthy()
    for (const style of BOT_EYE_STYLES) expect(BOT_EYE_STYLE_LABELS[style]).toBeTruthy()
  })

  it('keys every colour uniquely, since the key is what gets persisted', () => {
    expect(new Set(BOT_COLORS.map((c) => c.name)).size).toBe(BOT_COLORS.length)
    expect(new Set(BOT_COLORS.map((c) => c.hex)).size).toBe(BOT_COLORS.length)
  })

  it('drops the silhouettes that were tuned for a 3D face', () => {
    for (const gone of ['cone', 'pill', 'drop']) {
      expect(BOT_SHAPES as readonly string[]).not.toContain(gone)
    }
  })
})

describe('the prop registry', () => {
  it('carries a body and a meaning for every prop', () => {
    for (const id of AVATAR_PROP_IDS) {
      const prop = AVATAR_PROPS[id]
      expect(prop.body.length).toBeGreaterThan(0)
      expect(prop.meaning.length).toBeGreaterThan(0)
    }
  })

  it('records a dominant hue for every prop, so no glyph silently skips the solver', () => {
    for (const id of AVATAR_PROP_IDS) {
      expect(PROP_HUE).toHaveProperty(id)
      const hex = PROP_HUE[id]
      if (hex !== null) expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('recognises its own ids and rejects anything else', () => {
    expect(isAvatarPropId('search')).toBe(true)
    expect(isAvatarPropId('not-a-prop')).toBe(false)
    expect(isAvatarPropId(undefined)).toBe(false)
    expect(isAvatarPropId(null)).toBe(false)
  })

  it('leaves at least one body hue legible against every prop', () => {
    for (const id of AVATAR_PROP_IDS) {
      const hex = PROP_HUE[id]
      const propHue = hex ? hueOf(hex) : null
      if (propHue === null) continue
      const clear = BOT_COLORS.filter((c) => {
        const hue = hueOf(c.hex)
        return hue === null || hueSeparation(hue, propHue) >= MIN_PROP_HUE_SEPARATION
      })
      expect(clear.length).toBeGreaterThan(0)
    }
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

  it('draws every shape and eye style without throwing', () => {
    for (const shape of BOT_SHAPES) {
      for (const eyeStyle of [...BOT_EYE_STYLES, 'working' as const]) {
        const { unmount } = render(
          <BotMark shape={shape} eyeStyle={eyeStyle} label={`${shape}-${eyeStyle}`} />,
        )
        expect(partsOf(`${shape}-${eyeStyle}`, 'body')).toHaveLength(1)
        expect(partsOf(`${shape}-${eyeStyle}`, 'eyes')).toHaveLength(1)
        unmount()
      }
    }
  })

  it('paints the body in the resolved hue', () => {
    render(<BotMark color="leaf" label="leafy" />)
    expect(partsOf('leafy', 'body')[0]).toHaveAttribute('fill', '#10b981')
  })

  it('wears the resting face by default and the working one while busy', () => {
    const { rerender } = render(<BotMark label="worker" />)
    expect(partsOf('worker', 'eyes')[0]).toHaveAttribute('data-face', DEFAULT_BOT_EYE_STYLE)

    rerender(<BotMark label="worker" busy />)
    expect(partsOf('worker', 'eyes')[0]).toHaveAttribute('data-face', 'working')
  })

  it('keeps the chosen resting face out of the way of the busy one', () => {
    render(<BotMark label="sleeper" eyeStyle="sleepy" busy />)
    expect(partsOf('sleeper', 'eyes')[0]).toHaveAttribute('data-face', 'working')
  })

  it('draws the prop it is given', () => {
    render(<BotMark prop="headset" size={64} label="support" />)
    expect(partsOf('support', 'prop')[0]).toHaveAttribute('data-prop', 'headset')
  })

  it('draws no prop when it is given none, rather than guessing one', () => {
    render(<BotMark size={64} label="propless" />)
    expect(partsOf('propless', 'prop')).toHaveLength(0)

    render(<BotMark prop={null} size={64} label="cleared" />)
    expect(partsOf('cleared', 'prop')).toHaveLength(0)
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
    expect(markOf('bare').getAttribute('width')).not.toBe('0')
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
    render(<BotMark prop="search" size={96} label="hero" />)
    expect(partsOf('hero', 'ground')).toHaveLength(1)
    expect(partsOf('hero', 'prop')).toHaveLength(1)
  })

  it('drops the ground first, since a 3-unit ellipse muddies before anything else', () => {
    render(<BotMark prop="search" size={GROUND_MIN_SIZE - 1} label="mid" />)
    expect(partsOf('mid', 'ground')).toHaveLength(0)
    expect(partsOf('mid', 'prop')).toHaveLength(1)
  })

  it('keeps the ground at exactly the threshold, not one pixel above it', () => {
    render(<BotMark prop="search" size={GROUND_MIN_SIZE} label="edge" />)
    expect(partsOf('edge', 'ground')).toHaveLength(1)
  })

  it('drops the prop below its own threshold', () => {
    render(<BotMark prop="search" size={PROP_MIN_SIZE - 1} label="tiny" />)
    expect(partsOf('tiny', 'prop')).toHaveLength(0)
  })

  it('keeps the prop at exactly its threshold', () => {
    render(<BotMark prop="search" size={PROP_MIN_SIZE} label="prop-edge" />)
    expect(partsOf('prop-edge', 'prop')).toHaveLength(1)
  })

  it('never drops the body or the face, however small it gets', () => {
    render(<BotMark prop="search" size={12} label="dot" />)
    expect(partsOf('dot', 'body')).toHaveLength(1)
    expect(partsOf('dot', 'eyes')).toHaveLength(1)
  })
})
