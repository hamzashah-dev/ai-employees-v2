import type { FC } from 'react'
import { ROUTINES_ITEM } from '../../constants'
import { NavRow } from '../nav-row'

/**
 * Pinned under the roster rather than scrolling with it: routines belong to the
 * whole team, so they must stay reachable however long the list grows.
 */
export const RoutinesRow: FC = () => <NavRow item={ROUTINES_ITEM} />
