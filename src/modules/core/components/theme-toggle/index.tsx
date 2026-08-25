import type { FC } from 'react'
import { DesktopIcon } from '@repo/icons/desktop-icon'
import { MoonIcon } from '@repo/icons/moon-icon'
import { SunIcon } from '@repo/icons/sun-icon'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { useTheme } from '@/modules/core/hooks/use-theme'

/**
 * `theme-icon` is a painter's palette and `color-mode` is three overlapping circles — both
 * read as colour *pickers*, not as light and dark. `sun-moon-icon` is the pair with a
 * diagonal slash through it, which is what imagine-computer-web uses on the closed submenu
 * trigger; here the control is never closed over its state, so it shows the state itself.
 */
const ICONS = { system: DesktopIcon, light: SunIcon, dark: MoonIcon }

/**
 * One button cycling system → light → dark.
 *
 * imagine-computer-web renders the same three choices as a submenu inside the sidebar
 * footer's account menu — but this app's sidebar footer has no menu to nest inside (its
 * settings control is disabled, there being nothing behind it), and a top-bar control that
 * opens a menu to change one value costs two clicks instead of one. Cycling keeps every
 * state reachable and every state visible; if the account menu is ever built, this should
 * move into it and become upstream's submenu.
 */
export const ThemeToggle: FC<{ className?: string }> = ({ className }) => {
  const { preference, label, nextLabel, cycleTheme } = useTheme()
  const Icon = ICONS[preference]

  return (
    <Button
      type="button"
      variant="icon-ghost"
      size="icon-sm"
      shape="pill"
      onClick={cycleTheme}
      aria-label={`Theme: ${label}. Switch to ${nextLabel}.`}
      title={`Theme: ${label}`}
      className={cn('shrink-0 text-secondary', className)}
    >
      <Icon className="size-4" />
    </Button>
  )
}
