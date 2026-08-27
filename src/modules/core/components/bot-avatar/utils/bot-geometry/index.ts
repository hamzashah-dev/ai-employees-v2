import {
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  type BufferGeometry,
  type Material,
  type Object3D,
  type Vector3,
} from 'three'
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js'
import { BOT_EYE_ANCHORS } from '../../constants'
import type { BotEyeStyle, BotShape } from '../../types'

/**
 * Every mesh the bot is made of.
 *
 * Pure builders, no scene and no React: hand them materials and they hand back an `Object3D`
 * the caller owns and must dispose. Split from `bot-scene` so the shape maths can be read —
 * and reasoned about — without the animation loop in the way.
 *
 * Segment counts are lower than the prototype's (96×96 spheres, 72-segment lathes). These
 * render at 128–256 CSS px where the difference is invisible, and the geometry is rebuilt on
 * every shape change, so the build cost is paid interactively rather than once at startup.
 */

/** Signed power — the superellipsoid's exponent has to survive a negative base. */
const signedPow = (value: number, exponent: number): number =>
  Math.sign(value) * Math.pow(Math.abs(value), exponent)

/**
 * A superellipsoid: the family that runs from a box through a squircle to a sphere as the
 * exponents rise. `squircle` and `pill` are both this surface at different settings, which is
 * why they read as siblings rather than as two unrelated blobs.
 */
const superellipsoidGeometry = (
  n1: number,
  n2: number,
  sx: number,
  sy: number,
  sz: number,
): BufferGeometry =>
  new ParametricGeometry(
    (uu: number, vv: number, target: Vector3) => {
      const u = uu * Math.PI * 2 - Math.PI
      const v = vv * Math.PI - Math.PI / 2
      target.set(
        sx * signedPow(Math.cos(v), n1) * signedPow(Math.cos(u), n2),
        sy * signedPow(Math.sin(v), n1),
        sz * signedPow(Math.cos(v), n1) * signedPow(Math.sin(u), n2),
      )
    },
    64,
    44,
  )

/**
 * A sphere pushed around by three out-of-phase sine waves.
 *
 * The frequencies are mutually irrational-ish on purpose: a common factor would line the
 * lumps up into a visible lattice instead of the hand-modelled asymmetry this is after.
 */
const blobGeometry = (): BufferGeometry => {
  const geometry = new SphereGeometry(1, 72, 56)
  const position = geometry.attributes.position
  if (!position) return geometry

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const displace =
      0.07 * Math.sin(x * 3.1 + 1.3) +
      0.055 * Math.sin(y * 2.6 + 2.4) +
      0.06 * Math.sin(z * 3.4 + 0.6)
    const scale = 1 + displace
    position.setXYZ(i, x * scale, y * scale, z * scale)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** A silhouette spun around Y. `cone` and `drop` differ only in their profile. */
const revolvedGeometry = (profile: readonly (readonly [number, number])[]): BufferGeometry => {
  const geometry = new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    56,
  )
  geometry.computeVertexNormals()
  return geometry
}

/** Five overlapping spheres. Cheaper and rounder than a real metaball field, and it reads. */
const cloudGroup = (material: Material): Group => {
  const group = new Group()
  const puffs: readonly (readonly [number, number, number, number])[] = [
    [0, 0.12, 0, 0.62],
    [-0.58, -0.12, 0.02, 0.48],
    [0.58, -0.08, 0.02, 0.46],
    [-0.2, -0.3, 0.12, 0.4],
    [0.25, -0.32, 0.1, 0.38],
  ]
  for (const [x, y, z, radius] of puffs) {
    const puff = new Mesh(new SphereGeometry(radius, 40, 30), material)
    puff.position.set(x, y, z)
    group.add(puff)
  }
  return group
}

const CONE_PROFILE = [
  [0, -0.95],
  [0.52, -0.93],
  [0.86, -0.78],
  [0.92, -0.6],
  [0.52, 0.3],
  [0.16, 0.95],
  [0, 1.02],
] as const

const DROP_PROFILE = [
  [0, -1.02],
  [0.5, -0.97],
  [0.8, -0.72],
  [0.84, -0.4],
  [0.5, 0.32],
  [0.12, 0.92],
  [0, 1.04],
] as const

/**
 * The body for a shape.
 *
 * `flatMaterial` is the same colour with `flatShading` on, and only `hex` uses it: a
 * six-sided cylinder with smooth normals looks like a badly-tessellated sphere, and the
 * whole point of that shape is the facets.
 */
export const createBotBody = (
  shape: BotShape,
  material: Material,
  flatMaterial: Material,
): Object3D => {
  switch (shape) {
    case 'blob':
      return new Mesh(blobGeometry(), material)
    case 'squircle':
      return new Mesh(superellipsoidGeometry(0.32, 0.32, 0.92, 0.92, 0.92), material)
    case 'pill':
      return new Mesh(superellipsoidGeometry(0.62, 0.62, 1.32, 0.78, 0.82), material)
    case 'cone':
      return new Mesh(revolvedGeometry(CONE_PROFILE), material)
    case 'hex': {
      const prism = new Mesh(new CylinderGeometry(1, 1, 0.9, 6, 1), flatMaterial)
      // Laid on its side so a flat face points at the camera, then rolled a half-facet so
      // the silhouette is a point-up hexagon rather than a flat-topped one.
      prism.rotation.x = Math.PI / 2
      prism.rotation.y = Math.PI / 6
      // Wrapped, so the caller can still treat every body as an untransformed child.
      const wrapper = new Group()
      wrapper.add(prism)
      return wrapper
    }
    case 'cloud':
      return cloudGroup(material)
    case 'drop':
      return new Mesh(revolvedGeometry(DROP_PROFILE), material)
    case 'round':
    default:
      return new Mesh(new SphereGeometry(1, 64, 48), material)
  }
}

/** The resting Y scale of an eye, stashed so the blink can scale relative to it. */
export interface EyeUserData {
  restingScaleY: number
}

/**
 * The eyes for a shape and style, as one group.
 *
 * Each mesh records its resting Y scale in `userData`, because the blink squashes eyes that
 * do not all start at the same height — a `visor` is 0.5 tall and a `sleepy` lid 0.34 — and
 * a blink that sets an absolute scale would pop them all to the same shape on the way down.
 */
export const createBotEyes = (
  shape: BotShape,
  eyeStyle: BotEyeStyle,
  material: Material,
): Group => {
  const anchor = BOT_EYE_ANCHORS[shape]
  const group = new Group()
  const eyeball = () => new SphereGeometry(0.13, 24, 18)

  if (eyeStyle === 'visor') {
    const visor = new Mesh(eyeball(), material)
    visor.scale.set(2.7 * anchor.scale, 0.5 * anchor.scale, 0.5 * anchor.scale)
    visor.position.set(0, anchor.y + 0.02, anchor.z)
    group.add(visor)
  } else if (eyeStyle === 'happy') {
    for (const side of [-1, 1]) {
      // A half torus — the "^ ^" of a smiling face, drawn as geometry rather than a texture.
      const arc = new Mesh(
        new TorusGeometry(0.14 * anchor.scale, 0.048 * anchor.scale, 10, 28, Math.PI),
        material,
      )
      arc.position.set(side * anchor.x, anchor.y - 0.02, anchor.z)
      group.add(arc)
    }
  } else if (eyeStyle === 'sleepy') {
    for (const side of [-1, 1]) {
      const lid = new Mesh(eyeball(), material)
      lid.scale.set(1.2 * anchor.scale, 0.34 * anchor.scale, 0.5 * anchor.scale)
      lid.rotation.z = side * 0.16
      lid.position.set(side * anchor.x, anchor.y, anchor.z)
      group.add(lid)
    }
  } else {
    for (const side of [-1, 1]) {
      const eye = new Mesh(eyeball(), material)
      eye.scale.set(1.05 * anchor.scale, 0.8 * anchor.scale, 0.5 * anchor.scale)
      eye.position.set(side * anchor.x, anchor.y, anchor.z)
      group.add(eye)
    }
  }

  for (const eye of group.children) {
    ;(eye.userData as EyeUserData).restingScaleY = eye.scale.y
  }
  return group
}

/**
 * Release every geometry under `root`.
 *
 * Materials are deliberately left alone: they are shared across bodies and eyes and outlive
 * a rebuild, so the scene disposes those once, at teardown. The prototype disposed neither,
 * which leaked a full geometry buffer to the GPU on every shape change — with eight shapes
 * and a picker in front of them, that is a leak a user can hit in seconds.
 */
export const disposeGeometries = (root: Object3D): void => {
  root.traverse((node) => {
    if (node instanceof Mesh) node.geometry.dispose()
  })
}
