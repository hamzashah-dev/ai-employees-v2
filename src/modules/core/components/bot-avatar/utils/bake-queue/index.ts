/**
 * One-at-a-time, deduplicated, cached work.
 *
 * Thirty roster rows mount in a single commit. Without this they would each ask the shared
 * renderer for a frame inside the same tick — thirty `setSize` + `render` + `toBlob` round
 * trips competing with the browser's first paint — and the twelve of them showing the same
 * employee twice over would each pay for it separately.
 *
 * So: identical keys share one promise, and distinct keys are chained rather than raced. The
 * chain matters more than it looks. The baker owns *one* renderer and *one* scene graph, and
 * a bake mutates both (`setLook`, `setSize`) before reading the canvas back; two bakes
 * interleaved would read each other's pixels.
 *
 * No `three` in here, and no DOM — the scheduling is the part worth testing.
 */
export interface BakeQueue<T> {
  /** The cached value for `key` if one has already resolved. Never triggers work. */
  peek: (key: string) => T | undefined
  /** The value for `key`, producing it if this is the first ask. */
  request: (key: string, produce: () => Promise<T>) => Promise<T>
  /** How many keys are known, resolved or in flight. */
  size: () => number
  /** Drop everything, handing each resolved value to `onDrop` so callers can release it. */
  clear: (onDrop?: (value: T) => void) => void
}

interface Entry<T> {
  promise: Promise<T>
  value?: T
  settled: boolean
}

export const createBakeQueue = <T>(): BakeQueue<T> => {
  const entries = new Map<string, Entry<T>>()
  /**
   * The end of the chain. It swallows rejections deliberately: one variant failing to bake
   * must not stop every later variant from being attempted.
   */
  let tail: Promise<unknown> = Promise.resolve()

  const request = (key: string, produce: () => Promise<T>): Promise<T> => {
    const existing = entries.get(key)
    if (existing) return existing.promise

    const promise = tail.then(produce).then(
      (value) => {
        const entry = entries.get(key)
        if (entry) {
          entry.value = value
          entry.settled = true
        }
        return value
      },
      (error: unknown) => {
        // Forget the failure so a later mount can retry rather than inheriting it forever.
        entries.delete(key)
        throw error
      },
    )

    tail = promise.catch(() => undefined)
    entries.set(key, { promise, settled: false })
    return promise
  }

  return {
    peek: (key) => {
      const entry = entries.get(key)
      return entry?.settled ? entry.value : undefined
    },
    request,
    size: () => entries.size,
    clear: (onDrop) => {
      if (onDrop) {
        for (const entry of entries.values()) {
          if (entry.settled && entry.value !== undefined) onDrop(entry.value)
        }
      }
      entries.clear()
    },
  }
}
