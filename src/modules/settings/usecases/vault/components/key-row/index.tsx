import type { FC } from 'react'
import { EditIcon } from '@repo/icons/edit'
import { EyeIcon } from '@repo/icons/eye-icon'
import { EyeSlashIcon } from '@repo/icons/eye-slash-icon'
import { LockIcon } from '@repo/icons/lock-icon'
import { TrashIcon } from '@repo/icons/trash'
import { Badge } from '@repo/ui/badge'
import { cn } from '@repo/ui/cn'
import { TableCell, TableRow } from '@repo/ui/table'
import { Spinner } from '@/modules/core/components/spinner'
import type { VaultKey } from '../../hooks/use-vault'

/** The 28px square the row's controls share, matching the canvas' icon buttons. */
const ICON_BUTTON =
  'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-secondary outline-none transition-colors hover:bg-fill-variant-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default disabled:text-disabled'

/** What a channel-managed row says instead of its description. */
const CHANNELS_NOTE = 'Configured on the Hermes dashboard'

interface KeyRowProps {
  row: VaultKey
  /** The real value, present only while this row is revealed. */
  revealed?: string
  isRevealing: boolean
  onReveal: () => void
  onHide: () => void
  onEdit: () => void
  onRemove: () => void
}

/**
 * One key: its name, its value, and the three things you can do to it.
 *
 * Two deliberate departures from the canvas' row:
 *
 * 1. **The eye stays live on a Channels row.** The canvas dims both of that row's controls.
 *    Reveal is a read — `POST /api/env/reveal` loads the `.env` and answers any key in it —
 *    so disabling it would claim a working control is unavailable. What is withheld is
 *    editing and removal, which would fight the dashboard page that owns the pairing.
 * 2. **Edit and remove are two buttons rather than one overflow menu.** Dropping the canvas'
 *    "Used by" and "Last used" columns freed the width, and a destructive action is better
 *    on the surface than one click deeper.
 */
export const KeyRow: FC<KeyRowProps> = ({
  row,
  revealed,
  isRevealing,
  onReveal,
  onHide,
  onEdit,
  onRemove,
}) => {
  const isRevealed = revealed !== undefined
  const secondary = row.channelManaged ? CHANNELS_NOTE : row.description

  return (
    <TableRow className="h-14 border-primary">
      <TableCell className="px-4">
        <span className="flex items-center gap-2.5">
          <LockIcon className="size-5 shrink-0 stroke-[1.125] text-secondary" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-label-md text-primary">{row.name}</span>
            {secondary && (
              <span className="truncate text-label-xs text-tertiary">{secondary}</span>
            )}
          </span>
          {row.channelManaged && (
            <Badge variant="neutral-subtle" size="md" className="shrink-0">
              Channels
            </Badge>
          )}
        </span>
      </TableCell>

      {/* Monospaced in both states so a revealed value occupies the same slot as the mask
          rather than the row jumping when one replaces the other. */}
      <TableCell
        className={cn('max-w-56 truncate font-mono text-label-sm', {
          'text-tertiary': !isRevealed,
          'text-primary select-all': isRevealed,
        })}
      >
        {revealed ?? row.masked}
      </TableCell>

      <TableCell className="px-4">
        <span className="flex justify-end gap-1">
          <button
            type="button"
            disabled={isRevealing}
            onClick={isRevealed ? onHide : onReveal}
            aria-label={isRevealed ? `Hide ${row.name}` : `Reveal ${row.name}`}
            className={ICON_BUTTON}
          >
            {isRevealing ? (
              <Spinner className="size-4" />
            ) : isRevealed ? (
              <EyeSlashIcon className="size-4 stroke-[1.4px]" />
            ) : (
              <EyeIcon className="size-4 stroke-[1.4px]" />
            )}
          </button>

          {!row.channelManaged && (
            <>
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Replace ${row.name}`}
                className={ICON_BUTTON}
              >
                <EditIcon className="size-4 stroke-[1.4px]" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${row.name}`}
                className={cn(ICON_BUTTON, 'hover:text-critical')}
              >
                <TrashIcon className="size-4 stroke-[1.4px]" />
              </button>
            </>
          )}
        </span>
      </TableCell>
    </TableRow>
  )
}
