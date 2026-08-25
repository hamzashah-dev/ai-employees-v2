import { useEffect, useState } from 'react'
import { formatElapsed } from '@/modules/core/utils/time'

/**
 * "00:12:41", ticking.
 *
 * One interval per working card, which is a handful at most, and none at all
 * when the turn carries no start time — a resumed session's does not, because
 * `workingSince` is stamped when *this* client starts a turn.
 */
export function useElapsed(sinceMs: number | undefined): string {
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (sinceMs == null) return
    setNowMs(Date.now())
    const id = setInterval(() => setNowMs(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [sinceMs])

  return sinceMs == null ? '' : formatElapsed(sinceMs, nowMs)
}
