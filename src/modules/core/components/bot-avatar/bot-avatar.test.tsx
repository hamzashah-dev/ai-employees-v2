import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BotAvatar } from '.'
import { BotGlyph } from './components/bot-glyph'
import { BotSprite, DEFAULT_SPRITE_DISPLAY_SIZE } from './components/bot-sprite'
import {
  BOT_COLORS,
  BOT_EYE_ANCHORS,
  BOT_EYE_STYLES,
  BOT_EYE_STYLE_LABELS,
  BOT_SHAPES,
  BOT_SHAPE_LABELS,
  DEFAULT_BOT_EYE_STYLE,
} from './constants'
import { createBakeQueue } from './utils/bake-queue'
import { BLINK_DURATION_MS, blinkScale, nextBlinkDelayMs } from './utils/blink'
import {
  SPRITE_BUCKETS,
  SPRITE_SUPERSAMPLE,
  botSpriteKey,
  spriteBucketFor,
  type BotSpriteVariant,
} from './utils/sprite-key'
import { eyeTintHex, glyphEyeHex, mixHex, resolveBotColorHex } from './utils/color'

/**
 * WebGL does not exist in jsdom, so nothing here asserts on a rendered pixel. What is worth
 * testing is the part that is arithmetic (the blink curve, the schedule, colour resolution),
 * the part that is a contract (the vocabulary is complete and internally consistent), and the
 * part that leaks if it is wrong (mount/unmount discipline — a stray rAF loop or a listener
 * left on `document` is invisible until the tab has been open an hour).
 */

const scene = vi.hoisted(() => ({
  setLook: vi.fn(),
  setPointerFollow: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  renderFrame: vi.fn(),
  blink: vi.fn(),
  dispose: vi.fn(),
}))
const createBotScene = vi.hoisted(() => vi.fn(() => scene))
const isWebGLAvailable = vi.hoisted(() => vi.fn(() => false))

vi.mock('./utils/bot-scene', () => ({ createBotScene, isWebGLAvailable }))

beforeEach(() => {
  vi.clearAllMocks()
  isWebGLAvailable.mockReturnValue(false)
})

describe('blinkScale', () => {
  it('rests at full height outside the blink', () => {
    expect(blinkScale(0)).toBe(1)
    expect(blinkScale(-50)).toBe(1)
    expect(blinkScale(BLINK_DURATION_MS)).toBe(1)
    expect(blinkScale(BLINK_DURATION_MS * 3)).toBe(1)
  })

  it('closes to a sliver at the midpoint rather than to zero', () => {
    // A lid that reaches exactly 0 makes the eye mesh degenerate and flip its normals.
    const closed = blinkScale(BLINK_DURATION_MS / 2)
    expect(closed).toBeGreaterThan(0)
    expect(closed).toBeLessThan(0.1)
  })

  it('falls then rises, and never leaves the unit range', () => {
    const samples = Array.from({ length: 25 }, (_, i) =>
      blinkScale((i / 24) * BLINK_DURATION_MS),
    )
    const trough = samples.indexOf(Math.min(...samples))

    expect(trough).toBeGreaterThan(0)
    expect(trough).toBeLessThan(samples.length - 1)
    for (let i = 1; i <= trough; i += 1) {
      expect(samples[i]!).toBeLessThanOrEqual(samples[i - 1]!)
    }
    for (let i = trough + 1; i < samples.length; i += 1) {
      expect(samples[i]!).toBeGreaterThanOrEqual(samples[i - 1]!)
    }
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThanOrEqual(1)
    }
  })
})

describe('nextBlinkDelayMs', () => {
  it('waits 2.2s to 5s when the double-take does not fire', () => {
    expect(nextBlinkDelayMs(sequence([0, 0.9]))).toBeCloseTo(2_200)
    expect(nextBlinkDelayMs(sequence([1, 0.9]))).toBeCloseTo(5_000)
  })

  it('pulls the occasional blink in close, as a double-take', () => {
    expect(nextBlinkDelayMs(sequence([1, 0.01]))).toBeCloseTo(3_300)
  })

  it('never schedules two blinks close enough to read as a twitch', () => {
    // The shortest reachable wait: the minimum 2.2s with the double-take pulling 1.7s off it.
    expect(nextBlinkDelayMs(sequence([0, 0.01]))).toBe(500)
    for (let i = 0; i < 200; i += 1) {
      expect(nextBlinkDelayMs()).toBeGreaterThanOrEqual(420)
    }
  })

  it('does not repeat itself', () => {
    const delays = new Set(Array.from({ length: 40 }, () => nextBlinkDelayMs()))
    expect(delays.size).toBeGreaterThan(30)
  })
})

const sequence = (values: number[]): (() => number) => {
  let index = 0
  return () => values[index++ % values.length]!
}

describe('colour resolution', () => {
  it('resolves a palette name to its hex', () => {
    expect(resolveBotColorHex('grape')).toBe('#7c5cff')
    expect(resolveBotColorHex('snow')).toBe('#e8e8ec')
  })

  it('passes a literal hex through, expanding shorthand', () => {
    expect(resolveBotColorHex('#123456')).toBe('#123456')
    expect(resolveBotColorHex('#ABC')).toBe('#aabbcc')
  })

  it('falls back to the default hue rather than throwing on junk', () => {
    expect(resolveBotColorHex(undefined)).toBe('#7c5cff')
    expect(resolveBotColorHex('chartreuse' as 'grape')).toBe('#7c5cff')
    expect(resolveBotColorHex('#nothex' as `#${string}`)).toBe('#7c5cff')
  })

  it('mixes componentwise in sRGB', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff')
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mixHex('#000000', '#ffffff', 5)).toBe('#ffffff')
  })

  it('keeps the 3D emissive tint on every hue but the palest', () => {
    /*
     * The regression this pins down is one the user saw on screen: the threshold used to sit
     * at 0.62 luminance, which caught Leaf (0.63) and Amber (0.68) — mid-toned hues that
     * should carry the same white arcs the 3D bot has — and gave them dark ones instead.
     * Snow is the only hue in the palette pale enough to genuinely need them.
     */
    for (const color of BOT_COLORS) {
      const matchesTheRenderedBot = glyphEyeHex(color.hex) === eyeTintHex(color.hex)
      expect({ name: color.name, matchesTheRenderedBot }).toEqual({
        name: color.name,
        matchesTheRenderedBot: color.name !== 'snow',
      })
    }
  })

  it('tints the eyes toward white while keeping the body hue', () => {
    const tint = eyeTintHex('#e14d4d')
    expect(tint).not.toBe('#ffffff')
    // Cherry's red channel still leads its blue channel after the mix.
    expect(parseInt(tint.slice(1, 3), 16)).toBeGreaterThan(parseInt(tint.slice(5, 7), 16))
  })
})

describe('the exported vocabulary', () => {
  it('offers eight shapes, four eye styles and eleven colours', () => {
    expect(BOT_SHAPES).toHaveLength(8)
    expect(BOT_EYE_STYLES).toHaveLength(4)
    expect(BOT_COLORS).toHaveLength(11)
  })

  it('names every shape, eye style and colour', () => {
    for (const shape of BOT_SHAPES) expect(BOT_SHAPE_LABELS[shape]).toBeTruthy()
    for (const eyeStyle of BOT_EYE_STYLES) expect(BOT_EYE_STYLE_LABELS[eyeStyle]).toBeTruthy()
    for (const color of BOT_COLORS) expect(color.label).toBeTruthy()
  })

  it('wears the happy face by default, everywhere', () => {
    expect(DEFAULT_BOT_EYE_STYLE).toBe('happy')
  })

  it('gives every shape somewhere to put its eyes', () => {
    for (const shape of BOT_SHAPES) {
      const anchor = BOT_EYE_ANCHORS[shape]
      expect(anchor.z).toBeGreaterThan(0)
      expect(anchor.scale).toBeGreaterThan(0)
    }
  })

  it('keys every colour uniquely, since the key is what gets persisted', () => {
    expect(new Set(BOT_COLORS.map((color) => color.name)).size).toBe(BOT_COLORS.length)
    expect(new Set(BOT_COLORS.map((color) => color.hex)).size).toBe(BOT_COLORS.length)
  })
})

describe('BotGlyph', () => {
  it('carries the accessible name an avatar needs', () => {
    render(<BotGlyph label="Ada avatar" />)
    expect(screen.getByRole('img', { name: 'Ada avatar' })).toBeInTheDocument()
  })

  it('steps out of the tree when the surrounding control is already labelled', () => {
    render(<BotGlyph label={null} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('draws every shape and eye style without throwing', () => {
    for (const shape of BOT_SHAPES) {
      for (const eyeStyle of BOT_EYE_STYLES) {
        const { unmount } = render(<BotGlyph shape={shape} eyeStyle={eyeStyle} color="sea" />)
        unmount()
      }
    }
  })
})

describe('BotAvatar', () => {
  it('shows a named avatar immediately, before the three chunk lands', () => {
    render(<BotAvatar label="Ada avatar" />)
    // The Suspense fallback is the flat glyph, so the surface never opens on an empty box.
    expect(screen.getByRole('img', { name: 'Ada avatar' })).toBeInTheDocument()
  })

  it('falls back to the flat glyph where there is no WebGL context', async () => {
    const { container } = render(<BotAvatar label="Ada avatar" />)
    await waitFor(() => expect(isWebGLAvailable).toHaveBeenCalled())

    expect(createBotScene).not.toHaveBeenCalled()
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ada avatar' })).toBeInTheDocument()
  })

  it('mounts and unmounts without leaving a listener on document', async () => {
    const added = vi.spyOn(document, 'addEventListener')
    const removed = vi.spyOn(document, 'removeEventListener')

    const { unmount } = render(<BotAvatar label="Ada avatar" />)
    await waitFor(() => expect(isWebGLAvailable).toHaveBeenCalled())
    unmount()

    const addedEvents = added.mock.calls.map(([event]) => event)
    const removedEvents = removed.mock.calls.map(([event]) => event)
    expect(addedEvents).toContain('visibilitychange')
    for (const event of addedEvents) expect(removedEvents).toContain(event)

    added.mockRestore()
    removed.mockRestore()
  })

  describe('with a WebGL context', () => {
    beforeEach(() => {
      isWebGLAvailable.mockReturnValue(true)
    })

    afterEach(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    })

    it('builds exactly one scene and disposes it on unmount', async () => {
      const { unmount } = render(<BotAvatar label="Ada avatar" />)
      await waitFor(() => expect(createBotScene).toHaveBeenCalledTimes(1))

      expect(scene.dispose).not.toHaveBeenCalled()
      unmount()
      // The renderer, its context and its rAF loop all go with this call.
      expect(scene.dispose).toHaveBeenCalledTimes(1)
    })

    it('runs the loop while on screen and visible', async () => {
      render(<BotAvatar label="Ada avatar" />)
      await waitFor(() => expect(scene.play).toHaveBeenCalled())
    })

    it('stops the loop dead when the tab is hidden, and restarts it on return', async () => {
      render(<BotAvatar label="Ada avatar" />)
      await waitFor(() => expect(scene.play).toHaveBeenCalled())
      scene.play.mockClear()

      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      act(() => void document.dispatchEvent(new Event('visibilitychange')))
      await waitFor(() => expect(scene.pause).toHaveBeenCalled())
      expect(scene.play).not.toHaveBeenCalled()

      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
      act(() => void document.dispatchEvent(new Event('visibilitychange')))
      await waitFor(() => expect(scene.play).toHaveBeenCalled())
    })

    it('mutates the existing scene on a look change instead of rebuilding it', async () => {
      const { rerender } = render(<BotAvatar label="Ada avatar" shape="round" color="sea" />)
      await waitFor(() => expect(createBotScene).toHaveBeenCalledTimes(1))

      rerender(<BotAvatar label="Ada avatar" shape="cloud" color="sea" />)
      await waitFor(() =>
        expect(scene.setLook).toHaveBeenCalledWith(
          expect.objectContaining({ shape: 'cloud', colorHex: '#33a893' }),
        ),
      )
      expect(createBotScene).toHaveBeenCalledTimes(1)
    })

    it('does not follow the pointer when the caller says not to', async () => {
      render(<BotAvatar label="Ada avatar" interactive={false} />)
      await waitFor(() => expect(createBotScene).toHaveBeenCalledTimes(1))
      expect(createBotScene).toHaveBeenCalledWith(expect.anything(), expect.anything(), false)
    })
  })
})

describe('sprite bucketing', () => {
  const variant = (over: Partial<BotSpriteVariant> = {}): BotSpriteVariant => ({
    shape: 'round',
    eyeStyle: 'happy',
    colorHex: '#7c5cff',
    displaySize: 36,
    ...over,
  })

  it('never picks a bucket that would have to be upscaled', () => {
    for (const size of [1, 12, 20, 24, 28, 32, 36, 40, 48, 64]) {
      expect(spriteBucketFor(size)).toBeGreaterThanOrEqual(size * SPRITE_SUPERSAMPLE)
    }
  })

  it('clamps rather than inventing a bucket for an absurd size', () => {
    const largest = SPRITE_BUCKETS[SPRITE_BUCKETS.length - 1]!
    expect(spriteBucketFor(4_000)).toBe(largest)
  })

  it('bakes one bitmap per look for the whole app, big enough for its largest avatar', () => {
    /*
     * No avatar surface passes its own `size`; they all take the default, so every one of
     * them shares a single cached bitmap per look. That default has to be at least as big as
     * the largest place an avatar is actually drawn — 64px on the marketplace detail header
     * — or that one is upscaled and soft. 20px grouped message through 64px header:
     */
    for (const size of [20, 24, 28, 36, 40, 48, 64]) {
      expect(spriteBucketFor(DEFAULT_SPRITE_DISPLAY_SIZE)).toBeGreaterThanOrEqual(
        size * SPRITE_SUPERSAMPLE,
      )
    }
    expect(botSpriteKey(variant({ displaySize: DEFAULT_SPRITE_DISPLAY_SIZE }))).toBe(
      botSpriteKey(variant({ displaySize: DEFAULT_SPRITE_DISPLAY_SIZE })),
    )
  })

  it('keys by what changes the pixels, and nothing else', () => {
    expect(botSpriteKey(variant())).toBe(botSpriteKey(variant()))
    // Same bucket, different requested size: the same bitmap serves both.
    expect(botSpriteKey(variant({ displaySize: 24 }))).toBe(
      botSpriteKey(variant({ displaySize: 28 })),
    )
    expect(botSpriteKey(variant({ colorHex: '#7C5CFF' }))).toBe(botSpriteKey(variant()))
  })

  it('separates every look that would render differently', () => {
    const keys = new Set<string>()
    for (const shape of BOT_SHAPES) {
      for (const eyeStyle of BOT_EYE_STYLES) {
        for (const color of BOT_COLORS) {
          keys.add(botSpriteKey(variant({ shape, eyeStyle, colorHex: color.hex })))
        }
      }
    }
    expect(keys.size).toBe(BOT_SHAPES.length * BOT_EYE_STYLES.length * BOT_COLORS.length)
  })
})

describe('createBakeQueue', () => {
  it('bakes a key once however many rows ask for it', async () => {
    const queue = createBakeQueue<string>()
    const produce = vi.fn(() => Promise.resolve('sprite'))

    // Thirty roster rows, twelve of them the same employee, all mounting in one commit.
    const all = await Promise.all(
      Array.from({ length: 12 }, () => queue.request('round|happy|#7c5cff|192', produce)),
    )

    expect(produce).toHaveBeenCalledTimes(1)
    expect(all.every((value) => value === 'sprite')).toBe(true)
    expect(queue.size()).toBe(1)
  })

  it('runs distinct keys one at a time, never overlapping', async () => {
    // The baker owns one renderer and one scene graph, and a bake mutates both before
    // reading the canvas back. Two in flight would read each other's pixels.
    const queue = createBakeQueue<string>()
    let inFlight = 0
    let maxInFlight = 0

    const produce = (key: string) => async () => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await Promise.resolve()
      inFlight -= 1
      return key
    }

    await Promise.all(['a', 'b', 'c', 'd'].map((key) => queue.request(key, produce(key))))

    expect(maxInFlight).toBe(1)
    expect(queue.size()).toBe(4)
  })

  it('answers an already-baked key synchronously, so a revisit does not flash', async () => {
    const queue = createBakeQueue<string>()
    expect(queue.peek('a')).toBeUndefined()

    const pending = queue.request('a', () => Promise.resolve('sprite'))
    // Still in flight: peek must not hand back a half-made value.
    expect(queue.peek('a')).toBeUndefined()

    await pending
    expect(queue.peek('a')).toBe('sprite')
  })

  it('forgets a failure so a later mount can retry it', async () => {
    const queue = createBakeQueue<string>()
    await expect(queue.request('a', () => Promise.reject(new Error('no context')))).rejects.toThrow(
      'no context',
    )
    expect(queue.size()).toBe(0)

    await expect(queue.request('a', () => Promise.resolve('sprite'))).resolves.toBe('sprite')
  })

  it('keeps going after one key fails', async () => {
    const queue = createBakeQueue<string>()
    const failed = queue.request('a', () => Promise.reject(new Error('boom')))
    const ok = queue.request('b', () => Promise.resolve('sprite'))

    await expect(failed).rejects.toThrow('boom')
    await expect(ok).resolves.toBe('sprite')
  })

  it('hands every cached value back on clear, so object URLs can be revoked', () => {
    const queue = createBakeQueue<string>()
    const dropped: string[] = []
    queue.clear((value) => dropped.push(value))
    expect(dropped).toEqual([])
    expect(queue.size()).toBe(0)
  })
})

describe('BotSprite', () => {
  it('paints a named avatar on the first frame, before anything is baked', () => {
    render(<BotSprite label="Ada avatar" color="leaf" />)
    // The flat stand-in, not a skeleton: a list never opens on holes where its avatars go.
    expect(screen.getByRole('img', { name: 'Ada avatar' })).toBeInTheDocument()
  })

  it('stays on the flat glyph where there is no WebGL, without an unhandled rejection', async () => {
    const { container, unmount } = render(<BotSprite label="Ada avatar" />)
    // Let the dynamic import of the baker resolve and reject.
    await act(async () => {
      await Promise.resolve()
    })

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
    unmount()
  })

  it('mounts a roster of them and tears it down without throwing', () => {
    const { unmount } = render(
      <ul>
        {BOT_COLORS.map((color, index) => (
          <li key={color.name}>
            <BotSprite
              color={color.name}
              shape={BOT_SHAPES[index % BOT_SHAPES.length]}
              label={`${color.label} avatar`}
            />
          </li>
        ))}
      </ul>,
    )

    expect(screen.getAllByRole('img')).toHaveLength(BOT_COLORS.length)
    unmount()
  })

  it('steps out of the accessibility tree when its control is already labelled', () => {
    render(<BotSprite label={null} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
