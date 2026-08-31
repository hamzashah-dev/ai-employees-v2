import { useId, type FC } from 'react'
import { PlusIcon } from '@repo/icons/plus'
import { SearchIcon } from '@repo/icons/search'
import { Button } from '@repo/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@repo/ui/dialog'
import { Skeleton } from '@repo/ui/skeleton'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table'
import { AddKeyDialog } from './components/add-key-dialog'
import { KeyRow } from './components/key-row'
import { useVault } from './hooks/use-vault'

/**
 * Settings › Vault — the keys the whole roster can use.
 *
 * Three things the canvas draws that this page deliberately does not, each because Hermes
 * tracks nothing behind them:
 *
 * - **"Used by"**, a count of employees per key. There is no usage record anywhere;
 *   `/api/env` answers `is_set`, `redacted_value`, `description` and `category` and no
 *   consumer at all.
 * - **"Last used"**, a relative timestamp per key. Same absence — nothing writes a read of a
 *   credential down, so every cell in that column would have been invented.
 * - **The override banner** ("3 keys are still held by one employee each") and the per-row
 *   "1 override" badge. Those need every employee's `.env` diffed against this one, and
 *   there is no endpoint that answers more than one profile's keys at a time; enumerating
 *   the roster to synthesise it would be a fabrication dressed as a count.
 *
 * What is left is the honest half: the key, the value, and what you can do to it.
 */
export const VaultView: FC = () => {
  const vault = useVault()
  const headingId = useId()
  const searchId = useId()

  const isFormOpen = vault.isAdding || vault.editingName !== undefined
  const isRemovalOpen = vault.removalName !== undefined
  const isDialogOpen = isFormOpen || isRemovalOpen

  return (
    <section aria-labelledby={headingId} className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center justify-between gap-2 px-5 pt-5 pb-1">
        <h2 id={headingId} className="text-label-lg text-primary">
          Vault
        </h2>

        <div className="flex items-center gap-2">
          <label
            htmlFor={searchId}
            className="flex h-8 w-[200px] items-center gap-2 rounded-xl border border-secondary bg-fill px-2.5 focus-within:ring-2 focus-within:ring-primary"
          >
            <SearchIcon className="size-4 shrink-0 text-tertiary" />
            <span className="sr-only">Search keys</span>
            <input
              id={searchId}
              type="text"
              value={vault.query}
              onChange={(event) => vault.setQuery(event.target.value)}
              placeholder="Search keys"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-label-md text-primary outline-none placeholder:text-tertiary"
            />
          </label>

          <Button type="button" variant="primary" size="sm" onClick={vault.openAdd}>
            <PlusIcon />
            Add key
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-3 pb-6">
        <p className="text-label-sm text-tertiary">
          Available to every employee on this roster. One holding its own key of the same
          name uses that instead.
        </p>

        {vault.isLoading && (
          <div
            role="status"
            aria-label="Loading the vault"
            className="flex flex-col gap-3 rounded-2xl border border-primary p-4"
          >
            <Skeleton className="h-4 w-48 bg-fill-elevated" />
            <Skeleton className="h-4 w-64 bg-fill-elevated" />
            <Skeleton className="h-4 w-40 bg-fill-elevated" />
          </div>
        )}

        {vault.error && (
          <p role="alert" className="text-label-md text-critical">
            {vault.error.message}
          </p>
        )}

        {/* A failed write with no dialog open — a 429 on reveal, a refused removal — has
            nowhere else to be said. Hermes' own words, not a paraphrase. */}
        {vault.writeError && !isDialogOpen && (
          <p role="alert" className="text-label-md text-critical">
            {vault.writeError}
          </p>
        )}

        {!vault.isLoading && !vault.error && vault.total === 0 && (
          <p className="text-label-md text-tertiary">
            The workspace vault is empty. A key added here is written to the workspace’s own{' '}
            <code className="font-mono">.env</code>, which every employee on the roster can
            read.
          </p>
        )}

        {vault.total > 0 && vault.keys.length === 0 && (
          <p className="text-label-md text-tertiary">No key matches “{vault.query.trim()}”.</p>
        )}

        {vault.keys.length > 0 && (
          <Table containerClassName="rounded-2xl border border-primary">
            <TableHeader>
              <TableRow className="border-primary hover:bg-transparent">
                <TableHead className="px-4">Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[104px] px-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vault.keys.map((row) => (
                <KeyRow
                  key={row.name}
                  row={row}
                  revealed={vault.revealed[row.name]}
                  isRevealing={vault.revealingName === row.name}
                  onReveal={() => vault.reveal(row.name)}
                  onHide={() => vault.hide(row.name)}
                  onEdit={() => vault.openEdit(row.name)}
                  onRemove={() => vault.askToRemove(row.name)}
                />
              ))}
            </TableBody>
          </Table>
        )}

        {/* True, and worth saying before the click: `POST /api/env/reveal` is capped at five
            reveals per 30 seconds process-wide and writes each one to the server log. */}
        <p className="text-label-xs text-tertiary">
          Revealing a value is rate-limited and recorded in the dashboard’s log.
        </p>
      </div>

      <AddKeyDialog
        open={isFormOpen}
        name={vault.editingName}
        error={isFormOpen ? vault.writeError : undefined}
        isSaving={vault.isSaving}
        onClose={vault.closeForm}
        onSubmit={vault.save}
      />

      <ConfirmRemoveDialog
        name={vault.removalName}
        error={isRemovalOpen ? vault.writeError : undefined}
        isRemoving={vault.isRemoving}
        onCancel={vault.cancelRemoval}
        onConfirm={vault.confirmRemoval}
      />
    </section>
  )
}

interface ConfirmRemoveDialogProps {
  /** The key being removed; `undefined` closes the dialog. */
  name?: string
  error?: string
  isRemoving: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Asked because the blast radius is the whole install, not this page.
 *
 * `DELETE /api/env` is more than a line delete: `remove_provider_env_credential` also clears
 * env-seeded `credential_pool` entries in `auth.json` and value-matched `config.yaml`
 * `api_key` mirrors, so a provider can drop out of the model picker as a side effect. There
 * is no undo and no copy of the value left anywhere.
 */
const ConfirmRemoveDialog: FC<ConfirmRemoveDialogProps> = ({
  name,
  error,
  isRemoving,
  onCancel,
  onConfirm,
}) => (
  <Dialog
    open={name !== undefined}
    onOpenChange={(next) => {
      if (!next) onCancel()
    }}
  >
    <DialogContent className="max-w-[440px] gap-0 rounded-3xl border-secondary bg-surface p-0">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-heading-xs text-primary">Remove {name}?</DialogTitle>
          <DialogDescription className="text-label-md text-tertiary">
            It is deleted from the workspace vault, so every employee that was relying on it
            loses it. One holding its own key of the same name keeps that one. The value is
            not recoverable.
          </DialogDescription>
        </div>

        {error && (
          <p role="alert" className="text-label-sm text-critical">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="error" onClick={onConfirm} disabled={isRemoving}>
            Remove
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
)
