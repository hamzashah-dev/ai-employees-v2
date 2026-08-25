import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { ROUTES } from '../../../../constants'
import type { RosterEntry } from '../../../../types'

/**
 * A roster row's live state: where it points, whether it is the open thread,
 * and which of the three trailing treatments the design calls for.
 */
export const useRosterRow = (entry: RosterEntry) => {
  const { pathname } = useLocation()
  const status = useChatStore((state) => state.threads[entry.profile]?.status)

  const to = `${ROUTES.EMPLOYEES}/${encodeURIComponent(entry.profile)}`
  const isOpen = pathname === to

  /**
   * The canvas's 6px dot means "this employee did something you have not seen".
   * Hermes stores no read state and the chat store tracks no last-seen, so this
   * is derived from the one honest signal there is: activity newer than the last
   * time this row's thread was open. Seeded at mount so a fresh load starts with
   * nothing unread rather than lighting up everyone who has ever run.
   */
  const seenAtRef = useRef(Date.now())

  useEffect(() => {
    if (isOpen) seenAtRef.current = Date.now()
  }, [isOpen, entry.activityMs])

  return {
    to,
    isWorking: status === 'working',
    needsUser: status === 'needs-you' || status === 'error',
    isUnread: !isOpen && entry.activityMs > seenAtRef.current,
  }
}
