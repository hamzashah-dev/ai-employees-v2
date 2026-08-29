import { useState, type FC, type FormEvent } from 'react'
import { EyeIcon } from '@repo/icons/eye-icon'
import { EyeSlashIcon } from '@repo/icons/eye-slash-icon'
import { LockIcon } from '@repo/icons/lock-icon'
import { MoreHorizontalIcon } from '@repo/icons/more-horizontal'
import { PlusIcon } from '@repo/icons/plus'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { Skeleton } from '@repo/ui/skeleton'
import { WithTooltip } from '@repo/ui/tooltip'
import { Spinner } from '@/modules/core/components/spinner'
import { SectionLabel } from '../section-label'
import { useVaultKeys } from '../../hooks/use-vault-keys'
import { isValidKeyName, type VaultKeyRow } from '../../utils/vault-keys'

/**
 * Hand-rolled because `@repo/ui` ships no text field — `packages/ui/src` contains no
 * `<input>` or `<textarea>` anywhere. Same class list the marketplace's requirement row
 * uses, so the two credential surfaces in the app look like one.
 */
const FIELD =
  'h-8 w-full min-w-0 rounded-xl border border-secondary bg-fill px-2.5 text-label-md text-primary placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:text-disabled'

/** The 28px square the reveal and manage controls share, matching the card's close button. */
const ICON_BUTTON =
  'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-secondary outline-none transition-colors hover:bg-fill-variant-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default disabled:text-disabled'

interface VaultsSectionProps {
  profile: string
  displayName: string
}

/**
 * The credentials this employee holds — its own `.env`, and nothing else.
 *
 * Real all the way down: `GET /api/env?profile=` lists, `PUT` writes, `DELETE` removes and
 * `POST /api/env/reveal` unmasks. All four run under `_profile_scope`, which re-roots
 * `COMPUTER_HOME` to `<profile>/`, so a key written here lands in that employee's `.env` and
 * no other. `load_env` reads that one file with no fallback to the install's root `.env`,
 * which is what makes "this employee's credentials" an honest heading rather than a
 * filtered view of a shared store.
 *
 * Two deliberate narrowings:
 *
 * 1. **Only keys that are set are listed.** The endpoint answers the whole catalogue — 295
 *    rows against 2 set on a stock install — and rendering that unfiltered would show an
 *    employee "holding" hundreds of services it has no key for.
 * 2. **Channel-managed keys are read-only here.** They belong to the Hermes dashboard's
 *    Channels page, which configures a whole platform rather than one variable; offering an
 *    Update box for half of that pairing would break the other half.
 */
export const VaultsSection: FC<VaultsSectionProps> = ({ profile, displayName }) => {
  const vault = useVaultKeys(profile)
  const [adding, setAdding] = useState(false)

  return (
    <section aria-label="Vaults" className="flex flex-col gap-0.5">
      <SectionLabel
        action={
          <Button
            type="button"
            variant="link-secondary"
            size="xs"
            onClick={() => {
              vault.clearWriteError()
              setAdding((on) => !on)
            }}
            className="gap-1"
          >
            {adding ? null : <PlusIcon className="size-3 stroke-[1.4px]" />}
            {adding ? 'Cancel' : 'Add key'}
          </Button>
        }
      >
        {vault.isLoading || vault.error ? 'Credentials' : `Credentials · ${vault.keys.length}`}
      </SectionLabel>

      {vault.isLoading && (
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-4 w-2/3 bg-fill-elevated" />
          <Skeleton className="h-4 w-1/2 bg-fill-elevated" />
        </div>
      )}

      {vault.error && (
        <p role="alert" className="py-2 text-label-md text-critical">
          {vault.error.message}
        </p>
      )}

      {vault.writeError && (
        <p role="alert" className="py-2 text-label-sm text-critical">
          {vault.writeError}
        </p>
      )}

      {adding && (
        <KeyForm
          onCancel={() => setAdding(false)}
          onSubmit={(name, value) => {
            vault.save(name, value)
            setAdding(false)
          }}
        />
      )}

      {!vault.isLoading && !vault.error && vault.keys.length === 0 && !adding && (
        <p className="py-2 text-label-md text-tertiary">
          {displayName} holds no credentials. Keys added here are written to this employee’s
          own <code className="font-mono">.env</code> — nothing is shared with the rest of
          the roster.
        </p>
      )}

      <ul className="flex flex-col">
        {vault.keys.map((key) => (
          <VaultRow
            key={key.name}
            row={key}
            revealed={vault.revealed[key.name]}
            isPending={vault.pendingName === key.name}
            onReveal={() => vault.reveal(key.name)}
            onHide={() => vault.hide(key.name)}
            onSave={(value) => vault.save(key.name, value)}
            onRemove={() => vault.remove(key.name)}
          />
        ))}
      </ul>

      {vault.keys.length > 0 && (
        <p className="pt-2 text-label-xs text-tertiary">
          Revealing a value is rate-limited and recorded in the dashboard’s log.
        </p>
      )}
    </section>
  )
}

interface VaultRowProps {
  row: VaultKeyRow
  /** The real value, present only while this row is revealed. */
  revealed?: string
  isPending: boolean
  onReveal: () => void
  onHide: () => void
  onSave: (value: string) => void
  onRemove: () => void
}

const VaultRow: FC<VaultRowProps> = ({
  row,
  revealed,
  isPending,
  onReveal,
  onHide,
  onSave,
  onRemove,
}) => {
  const [editing, setEditing] = useState(false)
  const isRevealed = revealed !== undefined

  return (
    <li className="flex flex-col gap-2 py-2">
      <div className="flex items-center gap-3">
        <LockIcon className="size-5 shrink-0 stroke-[1.125] text-secondary" />

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-mono text-label-md text-primary">{row.name}</span>
          <span className="truncate text-label-xs text-tertiary">
            {row.origin}
            {row.tools.length > 0 && ` · used by ${describeTools(row.tools)}`}
          </span>
        </span>

        {/* Monospaced so a masked and a revealed value occupy the same visual slot rather
            than the row jumping when one replaces the other. */}
        <span
          className={cn('shrink-0 font-mono text-label-xs', {
            'text-tertiary': !isRevealed,
            'max-w-40 truncate text-primary select-all': isRevealed,
          })}
        >
          {revealed ?? row.masked}
        </span>

        {row.isPassword && (
          <button
            type="button"
            disabled={isPending}
            onClick={isRevealed ? onHide : onReveal}
            aria-label={isRevealed ? `Hide ${row.name}` : `Reveal ${row.name}`}
            className={ICON_BUTTON}
          >
            {isPending ? (
              <Spinner />
            ) : isRevealed ? (
              <EyeSlashIcon className="size-4 stroke-[1.4px]" />
            ) : (
              <EyeIcon className="size-4 stroke-[1.4px]" />
            )}
          </button>
        )}

        {row.channelManaged ? (
          <ChannelManagedNote name={row.name} />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Manage ${row.name}`}
              className={ICON_BUTTON}
            >
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="flex w-44 flex-col gap-1 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
            >
              <DropdownMenuItem onSelect={() => setEditing(true)}>Update</DropdownMenuItem>
              <DropdownMenuItem onSelect={onRemove} className="text-critical">
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {editing && (
        <KeyForm
          name={row.name}
          onCancel={() => setEditing(false)}
          onSubmit={(_name, value) => {
            onSave(value)
            setEditing(false)
          }}
        />
      )}
    </li>
  )
}

/** "12 tools", or the names themselves while there are few enough to be worth reading. */
function describeTools(tools: string[]): string {
  if (tools.length <= 2) return tools.join(' and ')
  return `${tools.length} tools`
}

interface KeyFormProps {
  /** Set when updating an existing key — the name is then fixed and only the value is asked for. */
  name?: string
  onSubmit: (name: string, value: string) => void
  onCancel: () => void
}

const KeyForm: FC<KeyFormProps> = ({ name, onSubmit, onCancel }) => {
  const [draftName, setDraftName] = useState(name ?? '')
  const [draftValue, setDraftValue] = useState('')

  /*
   * The name rule is Hermes' own (`save_env_value`), checked here only to keep an obviously
   * malformed name off the wire. The *denylist* — PATH, LD_PRELOAD, COMPUTER_HOME — is not
   * mirrored: it would drift from the server's copy, and a refusal comes back as a 400
   * carrying its reason, which the section prints verbatim.
   */
  const nameOk = name !== undefined || isValidKeyName(draftName)
  const canSubmit = nameOk && draftValue.trim().length > 0

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(name ?? draftName, draftValue)
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-2xl border border-primary bg-fill-elevated px-4 py-3.5"
      aria-label={name ? `Update ${name}` : 'Add a key'}
    >
      {name === undefined && (
        <input
          autoFocus
          aria-label="Key name"
          placeholder="OPENAI_API_KEY"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value.toUpperCase())}
          className={cn(FIELD, 'font-mono')}
        />
      )}

      <input
        autoFocus={name !== undefined}
        type="password"
        aria-label={name ? `New value for ${name}` : 'Key value'}
        placeholder="Paste the value"
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        className={FIELD}
      />

      {draftName.length > 0 && !nameOk && (
        <p className="text-label-xs text-critical">
          A name must start with a letter or underscore and contain only letters, digits and
          underscores.
        </p>
      )}

      <div className="flex items-center justify-end gap-1">
        <Button type="button" variant="ghost" size="xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="xs" disabled={!canSubmit}>
          Save
        </Button>
      </div>
    </form>
  )
}

/**
 * A messaging credential, said out loud rather than quietly hidden.
 *
 * `channel_managed` marks the keys the dashboard's Channels page owns — 168 of the 295 rows
 * on this install. Those cards configure a platform as a unit (token, allowed users, proxy),
 * so rewriting one variable from here would leave the pairing half-changed.
 */
const ChannelManagedNote: FC<{ name: string }> = ({ name }) => (
  <WithTooltip
    content="Messaging credentials are configured on the Hermes dashboard’s Channels page, which owns the whole platform pairing"
    size="sm"
    showArrow={false}
    className="inline-flex shrink-0"
    tooltipContentProps={{ side: 'bottom', sideOffset: 6, className: 'max-w-60' }}
  >
    <span
      aria-label={`${name} is managed by the Hermes dashboard’s Channels page`}
      role="note"
      className="shrink-0 px-1 text-label-xs text-tertiary"
    >
      Channels
    </span>
  </WithTooltip>
)
