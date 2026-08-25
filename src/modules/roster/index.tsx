import type { FC } from 'react'
import { BrandRow } from './components/brand-row'
import { NavRow } from './components/nav-row'
import { RosterList } from './components/roster-list'
import { SidebarFooter } from './components/sidebar-footer'
import { TeamHeading } from './components/team-heading'
import { NAV_ITEMS, ROUTINES_ITEM } from './constants'
import type { RosterSidebarProps } from './types'

/**
 * The left sidebar.
 *
 * Geometry and treatment are ported from chatly-web's sidebar
 * (`modules/core/layouts/sidebar-layout/components/sidebar`): 16rem wide, rows
 * on a shared h-10 / rounded-xl / px-3 rhythm, hover and active states from the
 * same `fill-variant` tokens. Only the roster list scrolls; header, nav and
 * footer are pinned.
 */
export const RosterSidebar: FC<RosterSidebarProps> = () => (
  <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-canvas))]">
    <BrandRow />

    <nav className="px-2 pt-1">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </ul>
    </nav>

    <div className="mt-4 px-2">
      <TeamHeading />
    </div>

    <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto px-2">
      <RosterList />
    </div>

    <div className="px-2 pb-1">
      <ul>
        <NavRow item={ROUTINES_ITEM} />
      </ul>
    </div>

    <SidebarFooter />
  </aside>
)

export type { RosterSidebarProps }
