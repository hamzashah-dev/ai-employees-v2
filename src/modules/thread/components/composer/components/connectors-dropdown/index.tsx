import { useState, type FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { buttonVariants } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@repo/ui/sheet'
import { WithTooltip } from '@repo/ui/tooltip'
import { Spinner } from '@/modules/core/components/spinner'
import { useIsTablet } from '@/modules/core/hooks/media-query'
import { ConnectorsDialog } from '@/modules/thread/components/connectors-dialog'
import { useConnectorsDropdown } from './hooks/use-connectors-dropdown'

interface ConnectorsDropdownProps {
  profile: string
}

/**
 * Integrations — chatly-web's `ActiveConnectorsDropdown`.
 *
 * A "connector" there is an outside system the agent can reach, which here is
 * an MCP server: `/api/mcp/servers` lists them per profile and
 * `PUT …/enabled` flips one on or off. Upstream draws each active connector's
 * brand mark in the trigger; Hermes has no icon for an MCP server, so the
 * trigger carries the count instead of inventing artwork for it.
 *
 * Adding or authenticating a server is a Hermes dashboard job with no surface
 * in this app — the footer says so rather than offering a control that leads
 * nowhere.
 */
export const ConnectorsDropdown: FC<ConnectorsDropdownProps> = ({ profile }) => {
  const isTablet = useIsTablet()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { isOpen, setIsOpen, servers, enabledCount, isLoading, error, toggle, pendingName } =
    useConnectorsDropdown(profile)

  const hasActive = enabledCount > 0

  const triggerClassName = hasActive
    ? cn(
        'w-fit shrink-0 ring-0 data-[state=open]:bg-fill-secondary',
        buttonVariants({ variant: 'outline', shape: 'pill', size: 'sm' }),
      )
    : cn(
        'flex size-8 items-center justify-center rounded-full p-0 ring-0 data-[state=open]:bg-fill-secondary',
        buttonVariants({ variant: 'icon-outline', shape: 'pill', size: 'icon-sm' }),
      )

  const triggerInner = (
    <>
      <ConnectorsIcon className="size-4.5 stroke-[1.125]" />
      {hasActive && <span className="text-label-md">{enabledCount}</span>}
    </>
  )

  const content = (
    <>
      {isLoading && (
        <div className="flex items-center gap-2 px-2.5 py-2 text-label-md text-secondary">
          <Spinner />
          Loading integrations…
        </div>
      )}

      {error && (
        <p role="alert" className="px-2.5 py-2 text-label-md text-critical">
          {error.message}
        </p>
      )}

      {!isLoading && !error && servers.length === 0 && (
        <p className="px-2.5 py-2 text-label-md text-secondary">
          No MCP servers are configured for this employee.
        </p>
      )}

      {servers.map((server) => (
        <DropdownMenuItem
          key={server.name}
          // Radix closes the menu on select; toggling several servers in a row
          // is the common case, so the close is suppressed.
          onSelect={(event) => event.preventDefault()}
          onClick={() => toggle(server)}
          disabled={pendingName === server.name}
          className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-label-md text-primary"
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{server.name}</span>
            <span className="truncate text-label-xs text-tertiary">
              {server.transport === 'http' ? (server.url ?? 'http') : (server.command ?? server.transport)}
            </span>
          </span>
          {pendingName === server.name ? (
            <Spinner />
          ) : (
            <CheckIcon
              className={cn('size-4 shrink-0 text-primary', { invisible: !server.enabled })}
            />
          )}
        </DropdownMenuItem>
      ))}

      {servers.length > 0 && (
        <>
          <p className="px-2.5 pt-2 text-label-xs text-tertiary">
            Hermes reads this when a turn starts, so a change applies to the next message.
          </p>
          {/*
            The way to the full list. The menu is a toggle strip — a name and a tick — and
            the transport, address and brand mark do not fit in one; opening them out is a
            dialog rather than a taller menu, which is also what makes them reachable on the
            phone sheet.
          */}
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              setIsOpen(false)
              setDetailsOpen(true)
            }}
            className="mt-1 w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-label-md text-secondary transition-colors duration-200 ease-linear hover:bg-fill-variant-hover hover:text-primary focus-visible:bg-fill-variant-hover focus-visible:outline-none"
          >
            See all integrations
          </button>
        </>
      )}
    </>
  )

  const dialog = detailsOpen ? (
    <ConnectorsDialog profile={profile} open={detailsOpen} onOpenChange={setDetailsOpen} />
  ) : null

  if (!isTablet) {
    return (
      <>
        {dialog}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className={triggerClassName} aria-label="Integrations">
            {triggerInner}
          </SheetTrigger>
          <SheetContent side="bottom" className="gap-0 px-2 pb-2">
            {content}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <>
      {dialog}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className={triggerClassName} aria-label="Integrations">
          <WithTooltip content="Integrations">{triggerInner}</WithTooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          className="flex w-80 flex-col gap-1 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {content}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
