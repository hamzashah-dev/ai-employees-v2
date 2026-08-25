import type { FC } from 'react'
import type { PhraseBag } from './utils'
import { useEffect, useState } from 'react'
import { advanceBag, createBag, phraseAt } from './utils'

const ROTATE_INTERVAL_MS = 8_000

/**
 * A playful status phrase for when the model is working but has no specific step to
 * surface yet. Rotation rules live in `./utils`.
 *
 * Upstream runs the phrases through gt-next's `msg()`/`useMessages()`; this app has no
 * i18n, so they are plain strings.
 */
export const ThinkingPhrase: FC = () => {
  const [bag, setBag] = useState<PhraseBag>(createBag)

  useEffect(() => {
    const id = setInterval(() => setBag(advanceBag), ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return phraseAt(bag)
}
