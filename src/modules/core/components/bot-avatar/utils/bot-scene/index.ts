import { ACESFilmicToneMapping, SRGBColorSpace, WebGLRenderer } from 'three'
import { BLINK_DURATION_MS, blinkScale, nextBlinkDelayMs } from '../blink'
import { createBotStage, type BotStage, type BotStageLook } from '../bot-stage'

/**
 * The bot's renderer, animation loop and input — as one disposable instance.
 *
 * The prototype kept all of this at module scope. That is fine for a page that exists once
 * and never unmounts, and wrong here: a second `BotAvatar`, or the same one remounted by a
 * route change, would have shared one renderer and left an orphaned `requestAnimationFrame`
 * loop rendering into a detached canvas for the life of the tab. Everything below is
 * per-instance and every handle it opens is closed by `dispose()`.
 *
 * **One of these at a time.** It holds a live WebGL context, and browsers cap those at
 * roughly sixteen per page before they start dropping the oldest. Lists get `BotSprite`,
 * which bakes the same stage through one shared renderer into an `<img>`.
 *
 * There is no React in this file on purpose: the loop mutates `three` objects directly and
 * must never cause a re-render. React's only job is to mount it, feed it props and dispose it.
 */

export type BotSceneLook = BotStageLook

export interface BotScene {
  /** Recolour and/or rebuild. Cheap when nothing structural changed. */
  setLook: (look: BotSceneLook) => void
  /** Pointer-follow and drag-to-spin. Off means the bot faces front and ignores the pointer. */
  setPointerFollow: (enabled: boolean) => void
  /** Start the idle loop. No-op if already running. */
  play: () => void
  /** Stop the loop dead — not a slow-down, zero frames. */
  pause: () => void
  /** Paint exactly one frame at the current pose. For paused and reduced-motion states. */
  renderFrame: () => void
  /** Blink now, if not already mid-blink. */
  blink: () => void
  dispose: () => void
}

const MAX_PIXEL_RATIO = 2

const FLOAT_SPEED = 1.6
const FLOAT_AMPLITUDE = 0.07
const BREATHE_SPEED = 2.1
const BREATHE_AMPLITUDE = 0.014
/** How much of the breath's vertical stretch is paid back sideways. */
const BREATHE_SQUASH = 0.6

const POINTER_YAW = 0.35
const POINTER_PITCH = 0.2
const DRAG_YAW = 0.012
const DRAG_PITCH = 0.008
const MAX_DRAG_PITCH = 0.5

/**
 * Easing rates, expressed as "fraction closed per 60Hz frame" so they read the same as the
 * prototype's constants — `applyEase` converts them to the actual frame delta. Written as
 * bare multipliers they would make the bot track twice as fast on a 120Hz display, which is
 * the same class of bug as the prototype's hardcoded 16ms blink step.
 */
const POINTER_EASE = 0.03
const ROTATION_EASE = 0.12
const REFERENCE_FRAME_MS = 1_000 / 60

/**
 * The longest delta a single frame may claim.
 *
 * A backgrounded tab, a breakpoint in the debugger or a slow shape rebuild can hand the loop
 * a delta of seconds. Without this the bot would teleport through half a float cycle and fire
 * a blink instantly on the frame it comes back.
 */
const MAX_FRAME_MS = 100

const applyEase = (rate: number, deltaMs: number): number =>
  1 - Math.pow(1 - rate, deltaMs / REFERENCE_FRAME_MS)

/**
 * Is there a WebGL context to be had at all?
 *
 * Probed once, at module scope, because the answer cannot change within a page and because
 * creating a throwaway context per mount is not free. jsdom answers no, which is what lets
 * `BotAvatar` and `BotSprite` mount in a test and fall back to their flat glyph instead of
 * exploding.
 */
let webglSupport: boolean | undefined

export const isWebGLAvailable = (): boolean => {
  if (webglSupport !== undefined) return webglSupport
  try {
    const probe = document.createElement('canvas')
    webglSupport = Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'))
  } catch {
    webglSupport = false
  }
  return webglSupport
}

/** The renderer settings the hero canvas and the sprite baker must both use, or they diverge. */
export const applyBotRendererProfile = (renderer: WebGLRenderer): void => {
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9
}

export const createBotScene = (
  container: HTMLElement,
  initialLook: BotSceneLook,
  initialPointerFollow: boolean,
): BotScene => {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
  applyBotRendererProfile(renderer)
  renderer.domElement.style.display = 'block'
  // The canvas is decoration; the container carries `role="img"` and the accessible name.
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.appendChild(renderer.domElement)

  const stage: BotStage = createBotStage(initialLook)

  let pointerFollow = initialPointerFollow

  // --- animation state -------------------------------------------------------------------

  let rafId = 0
  /** rAF timestamp of the previous frame; 0 means "first frame after a start or resume". */
  let lastFrameMs = 0
  /**
   * Animation time, in seconds, advanced only by frames this instance actually rendered.
   *
   * The prototype read `Clock.getElapsedTime()` *and* `Clock.getDelta()`, which share one
   * internal timestamp — each call consumes the time the other was about to report, so the
   * float and the blink were silently stealing from each other. One accumulator, one delta,
   * derived once per frame, is the whole fix.
   */
  let elapsedSeconds = 0
  let blinkElapsedMs = -1
  let untilNextBlinkMs = nextBlinkDelayMs()

  let pointerX = 0
  let pointerY = 0
  let targetYaw = 0
  let targetPitch = 0
  let dragging = false
  let dragLastX = 0
  let dragLastY = 0
  let width = 0
  let height = 0

  const updateIdle = (deltaMs: number) => {
    const { head, shadow, shadowMaterial } = stage
    head.position.y = Math.sin(elapsedSeconds * FLOAT_SPEED) * FLOAT_AMPLITUDE

    /*
     * Squash and stretch. The prototype wrote this as `head.scale.set(2 - breathe, breathe, 1)`
     * followed by two lines overwriting x and z — so `2 - breathe` and that `1` never reached
     * the GPU, and the x it did use was computed twice. The surviving behaviour is the one
     * below: the head stretches vertically by `breathe` and pays 60% of it back on the two
     * horizontal axes, which is what keeps the volume looking roughly constant instead of the
     * bot inflating.
     */
    const breathe = 1 + Math.sin(elapsedSeconds * BREATHE_SPEED) * BREATHE_AMPLITUDE
    const squash = 1 + (1 - breathe) * BREATHE_SQUASH
    head.scale.set(squash, breathe, squash)

    if (pointerFollow && !dragging) {
      const ease = applyEase(POINTER_EASE, deltaMs)
      targetYaw += (pointerX * POINTER_YAW - targetYaw) * ease
      targetPitch += (pointerY * POINTER_PITCH - targetPitch) * ease
    }
    const settle = applyEase(ROTATION_EASE, deltaMs)
    head.rotation.y += (targetYaw - head.rotation.y) * settle
    head.rotation.x += (targetPitch - head.rotation.x) * settle

    // The shadow tightens and darkens as the bot drops, which is what sells the float as
    // height rather than as the whole scene sliding up and down.
    shadow.scale.setScalar(1 - head.position.y * 0.18)
    shadowMaterial.opacity = Math.min(1, 1 - head.position.y * 0.8)
  }

  const updateBlink = (deltaMs: number) => {
    if (blinkElapsedMs < 0) {
      untilNextBlinkMs -= deltaMs
      if (untilNextBlinkMs > 0) return
      blinkElapsedMs = 0
    }

    blinkElapsedMs += deltaMs
    if (blinkElapsedMs >= BLINK_DURATION_MS) {
      blinkElapsedMs = -1
      untilNextBlinkMs = nextBlinkDelayMs()
      stage.applyBlink(1)
      return
    }
    stage.applyBlink(blinkScale(blinkElapsedMs))
  }

  const renderFrame = () => {
    renderer.render(stage.scene, stage.camera)
  }

  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame)
    const deltaMs = lastFrameMs === 0 ? 0 : Math.min(now - lastFrameMs, MAX_FRAME_MS)
    lastFrameMs = now
    elapsedSeconds += deltaMs / 1_000
    updateIdle(deltaMs)
    updateBlink(deltaMs)
    renderFrame()
  }

  const play = () => {
    if (rafId !== 0) return
    // Not resuming from the old timestamp: the gap since the last frame is wall time the
    // animation did not live through, and charging it would make the bot lurch on resume.
    lastFrameMs = 0
    rafId = requestAnimationFrame(frame)
  }

  const pause = () => {
    if (rafId === 0) return
    cancelAnimationFrame(rafId)
    rafId = 0
    lastFrameMs = 0
  }

  // --- input -----------------------------------------------------------------------------

  const onPointerMove = (event: PointerEvent) => {
    if (!pointerFollow || width === 0 || height === 0) return
    // `offsetX/Y` rather than `getBoundingClientRect()`: the rect read forces a synchronous
    // layout on every pointer move, and the canvas already fills the container exactly.
    pointerX = (event.offsetX / width - 0.5) * 2
    pointerY = (event.offsetY / height - 0.5) * 2

    if (!dragging) return
    targetYaw += (event.clientX - dragLastX) * DRAG_YAW
    targetPitch += (event.clientY - dragLastY) * DRAG_PITCH
    targetPitch = Math.max(-MAX_DRAG_PITCH, Math.min(MAX_DRAG_PITCH, targetPitch))
    dragLastX = event.clientX
    dragLastY = event.clientY
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!pointerFollow) return
    dragging = true
    dragLastX = event.clientX
    dragLastY = event.clientY
    // Capture, so a drag that leaves the avatar still ends on this element. The prototype
    // listened on `window` for both move and up, which meant every pointer move anywhere on
    // the page ran its handler even when the bot was nowhere near the cursor.
    container.setPointerCapture?.(event.pointerId)
  }

  const endDrag = (event: PointerEvent) => {
    if (!dragging) return
    dragging = false
    container.releasePointerCapture?.(event.pointerId)
  }

  const onPointerLeave = () => {
    pointerX = 0
    pointerY = 0
  }

  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('pointerup', endDrag)
  container.addEventListener('pointercancel', endDrag)
  container.addEventListener('pointerleave', onPointerLeave)

  // --- sizing ----------------------------------------------------------------------------

  const resize = () => {
    const nextWidth = container.clientWidth
    const nextHeight = container.clientHeight
    if (nextWidth === 0 || nextHeight === 0) return
    if (nextWidth === width && nextHeight === height) return
    width = nextWidth
    height = nextHeight
    renderer.setSize(width, height)
    stage.setAspect(width / height)
    if (rafId === 0) renderFrame()
  }

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
  if (resizeObserver) resizeObserver.observe(container)
  else window.addEventListener('resize', resize)

  resize()
  renderFrame()

  return {
    setLook: (next) => {
      stage.setLook(next)
      if (rafId === 0) renderFrame()
    },
    setPointerFollow: (enabled) => {
      pointerFollow = enabled
      if (enabled) return
      dragging = false
      pointerX = 0
      pointerY = 0
      targetYaw = 0
      targetPitch = 0
      stage.head.rotation.set(0, 0, 0)
      if (rafId === 0) renderFrame()
    },
    play,
    pause,
    renderFrame,
    blink: () => {
      if (blinkElapsedMs < 0) untilNextBlinkMs = 0
    },
    dispose: () => {
      pause()
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener('resize', resize)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointerup', endDrag)
      container.removeEventListener('pointercancel', endDrag)
      container.removeEventListener('pointerleave', onPointerLeave)

      stage.dispose()
      // `dispose()` releases three's own GPU objects; `forceContextLoss()` tells the browser
      // it can reclaim the context itself. Browsers cap live WebGL contexts (~16), and a
      // surface that mounts and unmounts this avatar repeatedly would otherwise walk into
      // that ceiling and start losing the oldest ones.
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
