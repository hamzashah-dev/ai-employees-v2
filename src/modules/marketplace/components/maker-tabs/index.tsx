import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { ImagineLogo } from '@repo/icons/imagine-logo'
import { LayoutGridIcon } from '@repo/icons/layout-grid-icon'
import { PeopleIcon } from '@repo/icons/people-icon'
import { Badge } from '@repo/ui/badge'
import { TabsList, TabsTrigger } from '@repo/ui/tabs'
import type { MakerId } from '../../utils/filter-agents'

/**
 * The three top-level tabs from the user's reference, each with a 16px leading
 * glyph. `Made by Imagine` carries the reference's `NEW` badge; the reference's
 * own label reads "Made by Higgsfield" — that is their parent brand, ours is
 * Imagine.
 *
 * `LayoutGridIcon` for Discover, not `DiscoverIcon`: that one is the Discover
 * *credit card* logo, a white rounded rectangle at 46×29. Names in this icon set
 * are traps and have to be read, not guessed — see CLAUDE.md.
 */
const MAKER_TABS = [
  { id: 'discover', label: 'Discover', Icon: LayoutGridIcon, isNew: false },
  { id: 'community', label: 'Community', Icon: PeopleIcon, isNew: false },
  { id: 'imagine', label: 'Made by Imagine', Icon: ImagineLogo, isNew: true },
] as const satisfies readonly {
  id: MakerId
  label: string
  Icon: FC<PropsWithClassName>
  isNew: boolean
}[]

/**
 * Renders only the list — the `Tabs` root and the single `TabsContent` live on
 * the page, so the active trigger's `aria-controls` resolves to the grid it
 * actually controls rather than to nothing.
 *
 * `border-transparent` and `rounded-full` are the two overrides the reference
 * needs on the shipped secondary variant: a resting tab is ghost (glyph and
 * label in `content-secondary`, no fill, no outline) and the active one is a
 * filled pill, which `data-[state=active]:bg-fill-secondary` already supplies.
 */
export const MakerTabs: FC = () => (
  <TabsList aria-label="Filter agents by who made them" className="h-auto w-auto gap-1 px-0">
    {MAKER_TABS.map(({ id, label, Icon, isNew }) => (
      <TabsTrigger
        key={id}
        value={id}
        variant="secondary"
        size="md"
        className="rounded-full border-transparent"
        startSlot={<Icon className="size-4" />}
        endSlot={
          isNew ? (
            <Badge size="sm" variant="brand-on-surface">
              NEW
            </Badge>
          ) : null
        }
      >
        {label}
      </TabsTrigger>
    ))}
  </TabsList>
)
