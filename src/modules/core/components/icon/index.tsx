import type { FC, SVGProps } from 'react'

/**
 * Icon set.
 *
 * The canvas paints all 39 of its symbols with `currentColor` and sizes them
 * from the parent, so every icon here takes className only and inherits colour.
 * Stroke width 1.5 on a 24-grid, rounded joins — the ImagineArt family's shape.
 */

type IconProps = SVGProps<SVGSVGElement> & { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** The compose glyph chatly uses for "New Chat" (StartNewIcon). */
export const ComposeIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    <path d="M18.4 3.6a2 2 0 0 1 2.8 2.8L13 14.6l-3.5.7.7-3.5z" />
  </svg>
)

/** Sidebar collapse control, shown on header hover. */
export const CollapseIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M9.5 4v16" />
  </svg>
)

/** The Imagine mark — an eight-point asterisk, as in the product sidebar. */
export const LogoMarkIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2.2c.5 0 .9.4.9.9v4l2.4-2.4a.9.9 0 0 1 1.3 1.3l-2.4 2.4h4a.9.9 0 0 1 0 1.8h-4l2.4 2.4a.9.9 0 0 1-1.3 1.3l-2.4-2.4v4a.9.9 0 0 1-1.8 0v-4l-2.4 2.4a.9.9 0 0 1-1.3-1.3l2.4-2.4h-4a.9.9 0 0 1 0-1.8h4L6.4 6a.9.9 0 0 1 1.3-1.3l2.4 2.4v-4c0-.5.4-.9.9-.9z" />
  </svg>
)

export const SearchIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const PlusIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const SendIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
)

export const StopIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
  </svg>
)

export const AttachIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8-8a3.5 3.5 0 1 1 5 5l-8 8a2 2 0 0 1-3-3l7.5-7.5" />
  </svg>
)

export const ScreenIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M9 20h6M12 17v3" />
  </svg>
)

export const ClockIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const PauseIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M9.5 6v12M14.5 6v12" />
  </svg>
)

export const PlayIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
)

export const CloseIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const ChevronLeftIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="m14 6-6 6 6 6" />
  </svg>
)

export const SettingsIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
)

export const ShareIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M12 15V4M8.5 7.5 12 4l3.5 3.5" />
    <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
  </svg>
)

export const StoreIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M4 9h16l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
    <path d="M9 9V6a3 3 0 0 1 6 0v3" />
  </svg>
)

export const WarningIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M12 4.5 21 19.5H3z" />
    <path d="M12 10v4M12 16.8v.01" />
  </svg>
)

export const ChatIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
  </svg>
)

export const TeamIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="9" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a3.2 3.2 0 0 1 0 5.6M17.5 14.5a5.5 5.5 0 0 1 3 4.5" />
  </svg>
)
