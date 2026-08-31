import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { GroupRow } from '@/modules/core/utils/group-row'
import { ROUTES } from '../../../../constants'

/**
 * A group row's live state — deliberately the same three questions
 * `use-roster-row` asks of an employee, answered from the room instead.
 *
 * The unread rule is copied rather than shared: activity newer than the last
 * time this row's room was open, seeded at mount so a reload starts with nothing
 * unread. Sharing it would mean threading a store through both, and the two
 * disagree on where "activity" comes from — a thread's status for an employee, a
 * committed log entry for a room.
 */
export const useGroupRowState = (row: GroupRow) => {
  const { pathname } = useLocation()

  const to = `${ROUTES.GROUPS}/${encodeURIComponent(row.id)}`
  const isOpen = pathname === to

  const seenAtRef = useRef(Date.now())

  useEffect(() => {
    if (isOpen) seenAtRef.current = Date.now()
  }, [isOpen, row.activityMs])

  return {
    to,
    isWorking: row.speaking !== null,
    needsUser: row.needsYou !== null,
    isUnread: !isOpen && row.activityMs > seenAtRef.current,
  }
}
