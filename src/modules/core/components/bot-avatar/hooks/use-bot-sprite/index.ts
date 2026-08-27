import { useEffect, useRef, useState } from 'react'
/*
 * A *type-only* import of the baker, so its `three` dependency never reaches the bundle.
 * `verbatimModuleSyntax` erases this line outright; the runtime handle comes from the
 * dynamic `import()` below, which is what gives it its own chunk.
 */
import type * as BotBaker from '../../utils/bot-baker'
import { botSpriteKey, type BotSpriteVariant } from '../../utils/sprite-key'

/**
 * The baked sprite for one look, or `null` while it is still being made.
 *
 * Deliberately free of any static `three` import. This hook sits behind every avatar in the
 * app — roster rows, the thread header, marketplace cards — so importing the renderer here
 * would put ~130 KB of WebGL in the entry chunk and block first paint on it. The baker is
 * pulled in with a dynamic `import()` from inside the effect instead: the list paints its
 * flat glyphs immediately, the renderer arrives a moment later, and the sprites swap in.
 * Nobody ever sees an empty box.
 */

/**
 * Resolved URLs, mirrored out of the baker's own cache so a *synchronous* first render can
 * find one.
 *
 * Without this, navigating back to a roster whose sprites are already baked would still
 * flash a frame of flat glyphs, because the only way to ask the baker anything is to await
 * a dynamic import. Module scope, page lifetime, bounded by the vocabulary.
 */
const RESOLVED = new Map<string, string>()

let bakerModule: Promise<typeof BotBaker> | null = null

const loadBaker = () => {
  bakerModule ??= import('../../utils/bot-baker')
  return bakerModule
}

export const useBotSprite = (variant: BotSpriteVariant): string | null => {
  const key = botSpriteKey(variant)
  const [src, setSrc] = useState<string | null>(() => RESOLVED.get(key) ?? null)

  /*
   * The variant is read through a ref so the effect can depend on `key` alone. The key *is*
   * the variant's identity — two variants with the same key bake to the same pixels — so
   * depending on the object would re-run the effect on every render for nothing.
   */
  const variantRef = useRef(variant)
  useEffect(() => {
    variantRef.current = variant
  })

  useEffect(() => {
    const cached = RESOLVED.get(key)
    if (cached) {
      setSrc(cached)
      return
    }

    setSrc(null)
    let cancelled = false

    loadBaker()
      .then(({ bakeBotSprite }) => bakeBotSprite(variantRef.current))
      .then((url) => {
        RESOLVED.set(key, url)
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        // No WebGL, or the encode failed. The caller keeps drawing its flat glyph, which is
        // a complete avatar rather than a placeholder, so there is nothing to report.
      })

    return () => {
      cancelled = true
    }
  }, [key])

  return src
}
