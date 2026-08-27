import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  type CanvasTexture,
  type Object3D,
} from 'three'
import type { BotEyeStyle, BotShape } from '../../types'
import { createBotBody, createBotEyes, disposeGeometries, type EyeUserData } from '../bot-geometry'
import { eyeTintHex } from '../color'
import { createShadowTexture } from '../shadow-texture'

/**
 * The bot's scene graph, with no renderer and no clock attached.
 *
 * Two very different things draw this bot: `bot-scene`, which owns a canvas and animates it
 * for the one hero on screen, and `bot-baker`, which renders it once into a sprite for the
 * dozens of avatars in a list. They must agree down to the specular highlight — a roster row
 * and the modal showing visibly different bots for the same employee is the exact failure
 * `employee-avatar.test.tsx` was written to catch in the flat era. Sharing the lighting rig,
 * the materials and the geometry here is what makes that agreement structural rather than a
 * matter of keeping two files in sync.
 */

export interface BotStageLook {
  shape: BotShape
  eyeStyle: BotEyeStyle
  /** Already resolved to `#rrggbb` — the stage does not know the palette. */
  colorHex: string
}

export interface BotStage {
  scene: Scene
  camera: PerspectiveCamera
  /** The body and eyes together. `bot-scene` floats, breathes and rotates this. */
  head: Group
  /** The gradient ellipse under the bot, scaled and faded with the float. */
  shadow: Mesh
  shadowMaterial: MeshBasicMaterial
  setLook: (look: BotStageLook) => void
  /** Squash the eyes to `scale` of their resting height. 1 is fully open. */
  applyBlink: (scale: number) => void
  setAspect: (aspect: number) => void
  dispose: () => void
}

const CAMERA_FOV = 38

/**
 * Light intensities carry a factor of π that the prototype did not need.
 *
 * r128 rendered with `PHYSICALLY_CORRECT_LIGHTS` off, which multiplied irradiance by π in the
 * shader. Modern three removed the legacy path entirely, so the prototype's values land the
 * scene about 3× too dark. Multiplying here reproduces the r128 look exactly rather than
 * re-grading it by eye. `PointLight.decay` needs the same treatment: it defaulted to 1 then
 * and defaults to 2 now.
 */
const LEGACY_LIGHT_GAIN = Math.PI

export const createBotStage = (initialLook: BotStageLook): BotStage => {
  const scene = new Scene()
  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50)
  camera.position.set(0, 0.25, 4.6)
  camera.lookAt(0, 0, 0)

  const hemisphere = new HemisphereLight(0xffffff, 0x1c1922, 0.45 * LEGACY_LIGHT_GAIN)
  const key = new DirectionalLight(0xffffff, 0.7 * LEGACY_LIGHT_GAIN)
  key.position.set(2.6, 3.2, 2.4)
  const rim = new PointLight(0x9db4ff, 0.45 * LEGACY_LIGHT_GAIN, 20, 1)
  rim.position.set(-2.8, 1.4, -2.2)
  const fill = new DirectionalLight(0xffffff, 0.1 * LEGACY_LIGHT_GAIN)
  fill.position.set(0, -1, 3)
  scene.add(hemisphere, key, rim, fill)

  const shadowTexture: CanvasTexture | null = createShadowTexture()
  const shadowGeometry = new PlaneGeometry(2.6, 2.6)
  const shadowMaterial = new MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  })
  const shadow = new Mesh(shadowGeometry, shadowMaterial)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -1.42
  scene.add(shadow)

  const bodyMaterial = new MeshStandardMaterial({
    color: new Color(initialLook.colorHex),
    roughness: 0.45,
    metalness: 0.04,
  })
  const facetedMaterial = new MeshStandardMaterial({
    color: new Color(initialLook.colorHex),
    roughness: 0.45,
    metalness: 0.04,
    flatShading: true,
  })
  /**
   * The eyes are the body's own hue pushed 82% toward white, and *emissive* at 1.7.
   *
   * That intensity is what makes them read on a pale body: the emissive term is not clamped
   * before tone mapping, so on Snow the eyes clip to white while the lit body sits below it.
   * A flat renderer cannot reproduce that separation, which is why `BotGlyph` needs its own
   * answer and this one does not.
   */
  const eyeMaterial = new MeshStandardMaterial({
    color: 0x0c0c10,
    roughness: 0.35,
    metalness: 0,
    emissive: new Color(eyeTintHex(initialLook.colorHex)),
    emissiveIntensity: 1.7,
  })

  const head = new Group()
  scene.add(head)

  let look = initialLook
  let body: Object3D | null = null
  let eyes: Group | null = null
  let appliedBlinkScale = 1

  const rebuild = () => {
    if (body) {
      head.remove(body)
      disposeGeometries(body)
    }
    if (eyes) {
      head.remove(eyes)
      disposeGeometries(eyes)
    }
    body = createBotBody(look.shape, bodyMaterial, facetedMaterial)
    eyes = createBotEyes(look.shape, look.eyeStyle, eyeMaterial)
    head.add(body, eyes)
    appliedBlinkScale = 1
  }

  const applyBlink = (scale: number) => {
    if (!eyes || scale === appliedBlinkScale) return
    for (const eye of eyes.children) {
      eye.scale.y = (eye.userData as EyeUserData).restingScaleY * scale
    }
    appliedBlinkScale = scale
  }

  rebuild()

  return {
    scene,
    camera,
    head,
    shadow,
    shadowMaterial,

    setLook: (next) => {
      const recolour = next.colorHex !== look.colorHex
      const restructure = next.shape !== look.shape || next.eyeStyle !== look.eyeStyle
      look = next
      if (recolour) {
        bodyMaterial.color.set(next.colorHex)
        facetedMaterial.color.set(next.colorHex)
        eyeMaterial.emissive.set(eyeTintHex(next.colorHex))
      }
      if (restructure) rebuild()
    },

    applyBlink,

    setAspect: (aspect) => {
      if (!Number.isFinite(aspect) || aspect <= 0) return
      camera.aspect = aspect
      camera.updateProjectionMatrix()
    },

    dispose: () => {
      if (body) disposeGeometries(body)
      if (eyes) disposeGeometries(eyes)
      head.clear()
      scene.clear()
      bodyMaterial.dispose()
      facetedMaterial.dispose()
      eyeMaterial.dispose()
      shadowGeometry.dispose()
      shadowMaterial.dispose()
      shadowTexture?.dispose()
    },
  }
}
