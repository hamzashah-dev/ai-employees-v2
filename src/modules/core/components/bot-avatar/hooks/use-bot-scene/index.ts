import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { BotColorValue, BotEyeStyle, BotShape } from '../../types'
import {
  createBotScene,
  isWebGLAvailable,
  type BotScene,
  type BotSceneLook,
} from '../../utils/bot-scene'
import { resolveBotColorHex } from '../../utils/color'
import { usePrefersReducedMotion } from '../use-reduced-motion'

/**
 * React's entire involvement in the 3D avatar: mount it, feed it props, throttle it, dispose it.
 *
 * Nothing here re-renders per frame. The scene owns its own `requestAnimationFrame` loop and
 * mutates `three` objects in place; this hook only flips it between running and stopped and
 * pushes prop changes across the boundary. The two pieces of state it does keep — page
 * visibility and intersection — change a handful of times in a session, not sixty times a
 * second.
 */
export interface UseBotSceneOptions {
  shape: BotShape
  eyeStyle: BotEyeStyle
  color: BotColorValue
  /** Pointer-follow and drag-to-spin. Always off under `prefers-reduced-motion`. */
  interactive: boolean
}

export interface UseBotSceneResult {
  containerRef: RefObject<HTMLDivElement | null>
  /** False means there is no WebGL context to be had; the caller should draw the flat glyph. */
  isSupported: boolean
}

export const useBotScene = ({
  shape,
  eyeStyle,
  color,
  interactive,
}: UseBotSceneOptions): UseBotSceneResult => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<BotScene | null>(null)

  const [isSupported] = useState(isWebGLAvailable)
  const [isOnScreen, setIsOnScreen] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  )
  const prefersReducedMotion = usePrefersReducedMotion()

  const look = useMemo<BotSceneLook>(
    () => ({ shape, eyeStyle, colorHex: resolveBotColorHex(color) }),
    [shape, eyeStyle, color],
  )
  const pointerFollow = interactive && !prefersReducedMotion

  /*
   * The scene is constructed once and then mutated, so its constructor arguments are read
   * through refs. Putting `look` in the mount effect's dependencies would tear down the
   * renderer and rebuild every mesh each time somebody dragged a colour slider.
   */
  const lookRef = useRef(look)
  const pointerFollowRef = useRef(pointerFollow)

  useEffect(() => {
    lookRef.current = look
    pointerFollowRef.current = pointerFollow
  })

  useEffect(() => {
    const container = containerRef.current
    if (!isSupported || !container) return

    const scene = createBotScene(container, lookRef.current, pointerFollowRef.current)
    sceneRef.current = scene

    return () => {
      sceneRef.current = null
      scene.dispose()
    }
  }, [isSupported])

  /** A shape or colour change earns a blink — the bot noticing it has been redressed. */
  const isFirstLook = useRef(true)
  useEffect(() => {
    if (isFirstLook.current) {
      isFirstLook.current = false
      return
    }
    sceneRef.current?.setLook(look)
    sceneRef.current?.blink()
  }, [look])

  useEffect(() => {
    sceneRef.current?.setPointerFollow(pointerFollow)
  }, [pointerFollow])

  /**
   * A hidden tab still services `requestAnimationFrame` in some browsers and, more to the
   * point, a backgrounded avatar has nobody to entertain. Stop, do not throttle.
   */
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVisibilityChange = () => setIsPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  /** Scrolled out of view is the same as hidden as far as the loop is concerned. */
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof IntersectionObserver !== 'function') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (entry) setIsOnScreen(entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [isSupported])

  /*
   * `prefers-reduced-motion` stops the loop outright rather than slowing it, and that
   * deliberately takes the blink with it.
   *
   * The float and the breathe are obviously in scope for the preference. The blink is the
   * arguable one, and the call is: it goes too. It is a repeating, unprompted movement that
   * carries no information — exactly what WCAG 2.2.2 lets a user turn off — and keeping it
   * would mean holding a `requestAnimationFrame` loop and a live WebGL context open forever
   * to animate two ellipses every three seconds. What the user gets instead is one rendered
   * frame of the same bot, in the same pose, eyes open: the character survives, the motion
   * does not, and the cost drops to zero.
   */
  const shouldAnimate = isSupported && !prefersReducedMotion && isOnScreen && isPageVisible

  /*
   * Declared *after* the effect that builds the scene, which is what lets it read
   * `sceneRef.current` on the mount pass — React runs effects in declaration order — and is
   * why there is no "is the scene ready yet" state to re-render on.
   */
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (shouldAnimate) {
      scene.play()
      return
    }
    scene.pause()
    scene.renderFrame()
  }, [shouldAnimate])

  return { containerRef, isSupported }
}
