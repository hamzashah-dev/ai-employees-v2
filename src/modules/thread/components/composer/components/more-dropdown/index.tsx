import type { FC } from 'react'
import { PlusIcon } from '@repo/icons/plus'
import { UploadIcon } from '@repo/icons/upload-icon'
import { buttonVariants } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@repo/ui/sheet'
import { useIsTablet } from '@/modules/core/hooks/media-query'
import { Spinner } from '@/modules/core/components/spinner'

interface MoreDropdownProps {
  openFilePicker: () => void
  disabled: boolean
  /** An upload is in flight; the trigger shows it rather than the plus. */
  attaching: boolean
}

/**
 * The `+` at the head of the dock — chatly-web's `PromptBoxMoreDropdown`.
 *
 * Upstream's menu also carries web search, personalization and slash commands.
 * None of those exist behind Hermes, so the menu is left with the one entry
 * that does: staging a file against the session. The menu is kept rather than
 * collapsed into a bare button because it is the extension point, and because
 * the two apps are meant to feel the same under the same affordance.
 */
export const MoreDropdown: FC<MoreDropdownProps> = ({ openFilePicker, disabled, attaching }) => {
  const isTablet = useIsTablet()

  const triggerClassName = cn(
    'group flex size-8 items-center justify-center rounded-full p-0 ring-0',
    buttonVariants({ variant: 'icon-secondary', shape: 'pill', size: 'icon-sm' }),
  )

  const triggerIcon = attaching ? (
    <Spinner />
  ) : (
    <PlusIcon className="transition-transform duration-200 group-data-[state=open]:scale-120 group-data-[state=open]:-rotate-45" />
  )

  const item = (
    <DropdownMenuItem
      className="flex w-full items-center gap-2 px-2.5 py-2 text-label-md text-primary"
      onClick={openFilePicker}
      disabled={disabled || attaching}
    >
      <UploadIcon className="size-4.5 stroke-[1.2]! text-secondary" />
      Upload Photos &amp; Files
    </DropdownMenuItem>
  )

  if (!isTablet) {
    return (
      <Sheet>
        <SheetTrigger className={triggerClassName} aria-label="More" disabled={disabled}>
          {triggerIcon}
        </SheetTrigger>
        <SheetContent side="bottom" className="gap-0 px-2 pb-2">
          {item}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName} aria-label="More" disabled={disabled}>
        {triggerIcon}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="flex w-54 flex-col gap-1 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
        side="bottom"
        align="start"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {item}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
