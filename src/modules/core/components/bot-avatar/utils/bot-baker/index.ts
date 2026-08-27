import { WebGLRenderer } from 'three'
import { createBakeQueue } from '../bake-queue'
import { applyBotRendererProfile, isWebGLAvailable } from '../bot-scene'
import { createBotStage, type BotStage } from '../bot-stage'
import { botSpriteKey, spriteBucketFor, type BotSpriteVariant } from '../sprite-key'

/**
 * The bot, rendered once and reused as a picture.
 *
 * A roster is thirty avatars. Thirty `BotAvatar`s would be thirty WebGL contexts, and
 * browsers cap those around sixteen before they start dropping the oldest — so the list
 * would not merely be slow, avatars would blank out at random. The answer is the one the
 * component's own doc comment named: bake it. One renderer at module scope, one scene graph,
 * one render per distinct `(shape, eyes, hue, size bucket)`, and every list avatar is then an
 * `<img>` — no context, no `requestAnimationFrame`, no per-row loop.
 *
 * The stage is shared with the live hero (`bot-scene`), so a baked roster row and the
 * animated bot in the modal are the same bot under the same lights. That is structural, not
 * a convention: they call `createBotStage`.
 *
 * **The renderer is deliberately never torn down on unmount.** It is a page-lifetime
 * singleton. Disposing it when the last avatar unmounts would mean rebuilding a GL context
 * and every geometry the next time a list rendered — which, on a route change, is
 * immediately. `disposeBotBaker` exists for tests and hot reload, not for React.
 */

let renderer: WebGLRenderer | null = null
let stage: BotStage | null = null

const queue = createBakeQueue<string>()

const ensureRenderer = (): WebGLRenderer => {
  if (renderer) return renderer
  const next = new WebGLRenderer({
    antialias: true,
    alpha: true,
    /*
     * Required, not optional. Without it the drawing buffer is cleared as soon as the frame
     * is composited, and `toBlob` — which cannot run synchronously with the render — reads
     * back a transparent square. This is the one place the flag is worth its cost, because
     * reading the canvas back *is* the job.
     */
    preserveDrawingBuffer: true,
  })
  // The bucket already carries the supersample; letting the device ratio multiply it again
  // would quietly render a 384px sprite at 1152px on a 3× phone.
  next.setPixelRatio(1)
  applyBotRendererProfile(next)
  renderer = next
  return next
}

const ensureStage = (variant: BotSpriteVariant): BotStage => {
  if (stage) return stage
  stage = createBotStage(variant)
  return stage
}

const toObjectUrl = (canvas: HTMLCanvasElement): Promise<string> =>
  new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      resolve(canvas.toDataURL('image/png'))
      return
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(URL.createObjectURL(blob))
      else reject(new Error('Bot sprite could not be encoded'))
    }, 'image/png')
  })

const renderVariant = async (variant: BotSpriteVariant): Promise<string> => {
  const gl = ensureRenderer()
  const bot = ensureStage(variant)

  bot.setLook(variant)
  bot.applyBlink(1)

  /*
   * The resting pose, restored explicitly every time.
   *
   * The stage is shared across bakes and nothing else resets it, so a sprite must not
   * inherit the pose of whatever was baked before it. Eyes open, no float, no breath, facing
   * front — thirty rows framed identically is the whole point of a list.
   */
  bot.head.position.set(0, 0, 0)
  bot.head.rotation.set(0, 0, 0)
  bot.head.scale.set(1, 1, 1)
  bot.shadow.scale.setScalar(1)
  bot.shadowMaterial.opacity = 1

  /*
   * The hero's camera, unchanged, and that is a decision rather than laziness.
   *
   * A tighter crop would win maybe 20% of linear size, and the arithmetic says how much is
   * available: at fov 38 the half-extent at distance d is `d · tan(19°)` = 0.344·d, so 4.6
   * gives 1.584 against a widest body (`pill`) of 1.32 and a shadow reaching y = −1.47.
   * Tightening past d ≈ 4.15 starts clipping the pill. But the sprite and the live hero in
   * the modal are the same employee seen a second apart, and framing them differently makes
   * the avatar visibly jump scale when the modal opens. The lever for "too small" is the box,
   * not the crop.
   */
  const pixels = spriteBucketFor(variant.displaySize)
  gl.setSize(pixels, pixels, false)
  bot.setAspect(1)
  gl.render(bot.scene, bot.camera)

  return toObjectUrl(gl.domElement)
}

/**
 * The sprite for one variant, baked if it has not been seen before.
 *
 * Rejects where there is no WebGL at all; the caller keeps drawing `BotGlyph`.
 */
export const bakeBotSprite = (variant: BotSpriteVariant): Promise<string> => {
  if (!isWebGLAvailable()) {
    return Promise.reject(new Error('No WebGL context available for baking'))
  }
  return queue.request(botSpriteKey(variant), () => renderVariant(variant))
}

/** The sprite for a key if it is already baked, synchronously. Never starts work. */
export const peekBotSprite = (key: string): string | undefined => queue.peek(key)

/** How many variants the cache holds. Exported so a test can prove a roster does not thrash. */
export const bakedSpriteCount = (): number => queue.size()

/** For tests and hot reload only. React must never call this — see the note above. */
export const disposeBotBaker = (): void => {
  queue.clear((url) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  })
  stage?.dispose()
  stage = null
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer = null
}
