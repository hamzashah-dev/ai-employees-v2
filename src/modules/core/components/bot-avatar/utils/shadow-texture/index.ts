import { CanvasTexture, SRGBColorSpace } from 'three'

/**
 * The soft ellipse the bot floats above — a gradient sprite, not a shadow map.
 *
 * A real shadow map would mean a depth pass per frame for a blob that never changes shape,
 * and would cost the baker a second render target per sprite. This is one 256px canvas,
 * painted once per stage.
 */
export const createShadowTexture = (): CanvasTexture | null => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null

  const gradient = context.createRadialGradient(128, 128, 10, 128, 128, 120)
  gradient.addColorStop(0, 'rgba(0,0,0,0.42)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
