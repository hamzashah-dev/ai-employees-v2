import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { ChatBubbleIcon } from '@repo/icons/chat-bubble-icon'
import { ColorPaletteIcon } from '@repo/icons/color-palette'
import { DollarSignIcon } from '@repo/icons/dollar-sign-icon'
import { FileTextIcon } from '@repo/icons/file-text'
import { GraduationCapIcon } from '@repo/icons/graduation-cap-icon'
import { HeartPulseIcon } from '@repo/icons/heart-pulse-icon'
import { HomeIcon } from '@repo/icons/home-icon'
import { MegaphoneIcon } from '@repo/icons/megaphone-icon'
import { PeopleIcon } from '@repo/icons/people-icon'
import { ShieldCheckIcon } from '@repo/icons/shield-check'
import { TelescopeIcon } from '@repo/icons/telescope-icon'
import { TerminalIcon } from '@repo/icons/terminal-icon'
import { ToolBoxIcon } from '@repo/icons/tool-box'
import { IDENTITY_COLOR_BY_NAME } from '@/modules/core/constants/identity'

/**
 * The marketplace's shelf order.
 *
 * Hermes has no catalog backend and no notion of a category, so this list is
 * the only source of truth for both the filter chips and the section order on
 * the unfiltered page.
 */

export const AGENT_CATEGORIES = [
  'Personal',
  'Engineering',
  'Business Ops',
  'Content',
  'Research',
  'Creative',
  'Home & Devices',
  'Money',
  'Health & Wellbeing',
  'Comms',
  'Learning',
  'Security & Privacy',
  'Growth & Marketing',
] as const

export type AgentCategory = (typeof AGENT_CATEGORIES)[number]

/** The chip row: every category, preceded by the unfiltered default. */
export const CATEGORIES = ['All', ...AGENT_CATEGORIES] as const

export type MarketplaceCategory = (typeof CATEGORIES)[number]

/**
 * One line under each section heading, in the canvas's register — no full stop.
 *
 * Six of these are pinned verbatim by §6 of the design spec — Personal,
 * Engineering, Business Ops, Money, Comms and Health & Wellbeing — and are not
 * ours to reword. The other seven are this app's own.
 */
export const CATEGORY_SUBTITLES: Record<AgentCategory, string> = {
  Personal: 'Your own day, handled',
  Engineering: 'The work around the code',
  'Business Ops': 'Keep the business running',
  Content: 'Scripts, cuts and posts on cadence',
  Research: 'They read everything and hand back what matters',
  Creative: 'A rough idea, made into something you can ship',
  'Home & Devices': 'They run the house while you are not thinking about it',
  Money: 'Watch what leaves the account',
  'Health & Wellbeing': "The body you're stuck with",
  Comms: 'Who reaches you, and how',
  Learning: 'They turn reading into something that stays',
  'Security & Privacy': 'They watch the doors and tell you what to close',
  'Growth & Marketing': 'Launches, pages, and the posts around them',
}

/**
 * The 24px tile in each section header.
 *
 * The hue is one of the six employee identity colours, so a shelf header reads as
 * part of the same family as the blobs on its cards. Three are the canvas's own
 * choices — Personal blue with `ic-emp`, Business Ops green with `ic-toolbox`,
 * Content cyan with `ic-file`; the other ten follow the same rule, with no two
 * neighbouring shelves sharing a hue. Decorative, so the hue stays an inline
 * `rgb(...)`: there is no semantic token for an identity colour.
 */
export interface CategoryStyle {
  Icon: FC<PropsWithClassName>
  color: string
}

/*
 * Named rather than destructured by position. The shelf borrows the employee palette so a
 * category chip and an avatar cannot disagree about what "blue" is, but it wants six specific
 * hues out of the eight — picking them by index would make the palette's order load-bearing
 * for a file that has nothing to do with it.
 *
 * `cherry` used to fill the warm slot. It went when the palette was re-tuned for flat fills,
 * and `rose` takes its place: it is the only remaining hue in that part of the wheel, and it
 * keeps Creative and Health & Wellbeing distinct from the greens and blues either side.
 */
const {
  sky: BLUE,
  sea: CYAN,
  amber: YELLOW,
  grape: PURPLE,
  leaf: GREEN,
  rose: PINK,
} = IDENTITY_COLOR_BY_NAME

export const CATEGORY_STYLES: Record<AgentCategory, CategoryStyle> = {
  Personal: { Icon: PeopleIcon, color: BLUE },
  Engineering: { Icon: TerminalIcon, color: PURPLE },
  'Business Ops': { Icon: ToolBoxIcon, color: GREEN },
  Content: { Icon: FileTextIcon, color: CYAN },
  Research: { Icon: TelescopeIcon, color: BLUE },
  Creative: { Icon: ColorPaletteIcon, color: PINK },
  'Home & Devices': { Icon: HomeIcon, color: YELLOW },
  Money: { Icon: DollarSignIcon, color: GREEN },
  'Health & Wellbeing': { Icon: HeartPulseIcon, color: PINK },
  Comms: { Icon: ChatBubbleIcon, color: CYAN },
  Learning: { Icon: GraduationCapIcon, color: YELLOW },
  'Security & Privacy': { Icon: ShieldCheckIcon, color: BLUE },
  'Growth & Marketing': { Icon: MegaphoneIcon, color: PURPLE },
}
