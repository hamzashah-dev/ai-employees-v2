import type { FC } from 'react'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@repo/ui/dialog'
import { ConnectorsSection } from './components/connectors-section'

interface ConnectorsDialogProps {
  profile: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Every MCP server this employee has, with the detail the composer's dropdown has no room
 * for: the transport it speaks, the address or command behind it, and its brand mark where
 * the library has one.
 *
 * It hangs off the composer's Integrations control rather than off the employee panel,
 * because that control is already the place connectors are turned on and off mid-conversation
 * — this is the same list, opened out. The panel deliberately says nothing about connectors:
 * two places to read one state is how the two get to disagree.
 *
 * What neither surface can show is whether a server is *signed in*. `_mcp_server_summary`
 * returns `auth` — how a server authenticates — and never whether it has; only
 * `POST …/{name}/test` knows, and it finds out by opening a live connection.
 */
export const ConnectorsDialog: FC<ConnectorsDialogProps> = ({
  profile,
  open,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {/* `aria-describedby={undefined}` is Radix's way of saying there is no description,
        rather than leaving it to warn about the missing one. */}
    <DialogContent
      aria-describedby={undefined}
      className="flex max-h-[684px] max-w-[560px] flex-col gap-0 overflow-hidden rounded-3xl border-secondary bg-surface p-0"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-5 pt-5 pb-1">
        <DialogTitle className="text-label-lg text-primary">Integrations</DialogTitle>
        <DialogCloseButton className="rounded-[10px] text-secondary" />
      </header>

      <div className="scrollbar-minimal flex-1 overflow-y-auto px-5 pt-3 pb-6">
        <ConnectorsSection profile={profile} />
      </div>
    </DialogContent>
  </Dialog>
)
