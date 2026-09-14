import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { BarChartIcon } from '@repo/icons/bar-chart-icon'
import { BinocularsIcon } from '@repo/icons/binoculars-icon'
import { BookOpenIcon } from '@repo/icons/book-open-icon'
import { BulbIcon } from '@repo/icons/bulb'
import { CalendarIcon } from '@repo/icons/calendar-icon'
import { CheckCircleIcon } from '@repo/icons/check-circle-icon'
import { CheckListIcon } from '@repo/icons/check-list-icon'
import { ClipboardIcon } from '@repo/icons/clipboard-icon'
import { CrownIcon } from '@repo/icons/crown'
import { DocumentIcon } from '@repo/icons/document-icon'
import { DollarSignIcon } from '@repo/icons/dollar-sign-icon'
import { FileTextIcon } from '@repo/icons/file-text'
import { GiftIcon } from '@repo/icons/gift-icon'
import { GlobeIcon } from '@repo/icons/globe-icon'
import { GraduationCapIcon } from '@repo/icons/graduation-cap-icon'
import { HeartPulseIcon } from '@repo/icons/heart-pulse-icon'
import { HomeIcon } from '@repo/icons/home-icon'
import { ImageIcon } from '@repo/icons/image-icon'
import { LineChartIcon } from '@repo/icons/line-chart-icon'
import { LockIcon } from '@repo/icons/lock-icon'
import { MegaphoneIcon } from '@repo/icons/megaphone-icon'
import { MessageBubbleIcon } from '@repo/icons/message-bubble-icon'
import { MusicIcon } from '@repo/icons/music'
import { NumbersIcon } from '@repo/icons/numbers-icon'
import { PeopleIcon } from '@repo/icons/people-icon'
import { PhoneIcon } from '@repo/icons/phone'
import { PuzzleIcon } from '@repo/icons/puzzle-icon'
import { RocketIcon } from '@repo/icons/rocket'
import { SearchIcon } from '@repo/icons/search'
import { ShieldCheckIcon } from '@repo/icons/shield-check'
import { ShoppingIcon } from '@repo/icons/shopping-icon'
import { SignatureIcon } from '@repo/icons/signature-icon'
import { StackIcon } from '@repo/icons/stack-icon'
import { TerminalIcon } from '@repo/icons/terminal-icon'
import { TimeClockIcon } from '@repo/icons/time-clock-icon'
import { TodoListIcon } from '@repo/icons/todo-list-icon'
import { TrendChartIcon } from '@repo/icons/trend-chart-icon'
import { UserIcon } from '@repo/icons/user'
import { VideoIcon } from '@repo/icons/video-icon'
import { ZapIcon } from '@repo/icons/zap'
import type { AvatarPropId } from '.'

/**
 * The logo on the cap, per job.
 *
 * Every entry is one of `@repo/icons` — the monorepo's own single-colour, `currentColor`,
 * 1.5-unit-stroke family — so the cap reads in the same hand as the rest of the interface,
 * and so nothing here has to be drawn or vendored. The renderer sizes them by a `size-full`
 * class inside a fixed box and tints them with the face colour.
 *
 * Chosen by looking at the artwork, not by name; the package has traps (`store` is four
 * circles, `clock` is a history arrow, `suite-icon` and `stocks-icon` hard-code their own
 * fill and ignore `currentColor`). Two were deliberately avoided for that last reason.
 */
export const AVATAR_PROP_GLYPHS: Record<AvatarPropId, FC<PropsWithClassName>> = {
  'search': SearchIcon,
  'binoculars': BinocularsIcon,
  'inspection': CheckCircleIcon,
  'survey': CheckListIcon,
  'calendar': CalendarIcon,
  'alarm-clock': TimeClockIcon,
  'todo-list': TodoListIcon,
  'manager': CrownIcon,
  'conference-call': PeopleIcon,
  'businessman': UserIcon,
  'briefcase': ClipboardIcon,
  'command-line': TerminalIcon,
  'deployment': RocketIcon,
  'puzzle': PuzzleIcon,
  'document': DocumentIcon,
  'news': FileTextIcon,
  'reading': BookOpenIcon,
  'graduation-cap': GraduationCapIcon,
  'calculator': NumbersIcon,
  'currency-exchange': DollarSignIcon,
  'bullish': TrendChartIcon,
  'line-chart': LineChartIcon,
  'bar-chart': BarChartIcon,
  'advertising': MegaphoneIcon,
  'headset': PhoneIcon,
  'comments': MessageBubbleIcon,
  'picture': ImageIcon,
  'music': MusicIcon,
  'film-reel': VideoIcon,
  'idea': BulbIcon,
  'signature': SignatureIcon,
  'package': GiftIcon,
  'shop': ShoppingIcon,
  'home': HomeIcon,
  'electricity': ZapIcon,
  'privacy': ShieldCheckIcon,
  'key': LockIcon,
  'data-backup': StackIcon,
  'globe': GlobeIcon,
  'like': HeartPulseIcon,
}
