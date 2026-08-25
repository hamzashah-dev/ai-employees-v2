import type { FC } from 'react'
import { NAV_ITEMS } from '../../constants'
import { NavRow } from '../nav-row'

export const NavSection: FC = () => (
  <nav aria-label="Sections">
    <ul className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavRow item={item} />
        </li>
      ))}
    </ul>
  </nav>
)
