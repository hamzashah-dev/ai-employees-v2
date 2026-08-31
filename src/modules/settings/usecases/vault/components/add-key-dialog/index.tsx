import { useId, useState, type FC, type FormEvent } from 'react'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@repo/ui/dialog'

/**
 * Hand-rolled because `@repo/ui` ships no text field — there is no `<input>` anywhere in
 * `packages/ui/src`. Same class list as the employee modal's vault form, so the two
 * credential surfaces in the app look like one field.
 */
const FIELD =
  'h-8 w-full min-w-0 rounded-xl border border-secondary bg-fill px-2.5 text-label-md text-primary placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:text-disabled'

/**
 * Hermes' own rule for an environment-variable name, mirrored so an obviously malformed name
 * is caught before the round trip: `save_env_value` rejects anything not matching
 * `^[A-Za-z_][A-Za-z0-9_]*$`.
 *
 * The *denylist* (`PATH`, `LD_PRELOAD`, `COMPUTER_HOME`, …) is deliberately not mirrored: it
 * lives in one place server-side and a copy here would drift. A denied name comes back as a
 * 400 carrying its reason, which this dialog prints verbatim.
 *
 * A second copy of this rule already exists in the employee modal's
 * `utils/vault-keys` — it cannot be imported, because a feature module may not reach into
 * another feature module's internals. **Promote it to `modules/core` when the employee-modal
 * page is retired** and delete whichever copy outlives the other.
 */
export function isValidKeyName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)
}

interface AddKeyDialogProps {
  open: boolean
  /**
   * Set when replacing an existing key's value: the name is then fixed and only the value is
   * asked for, because renaming a key is a remove plus an add, not a write.
   */
  name?: string
  /** Hermes' refusal from the last attempt, printed as it arrived. */
  error?: string
  isSaving: boolean
  onClose: () => void
  onSubmit: (name: string, value: string) => void
}

/**
 * Adding a key to the workspace vault, or replacing one's value.
 *
 * There is no verification step and the dialog does not pretend there is: Hermes has no
 * validator on this path — `save_env_value_secure` answers `validated: false` — so submit
 * means saved, and a spinner in front of a check that does not exist would be a lie.
 */
export const AddKeyDialog: FC<AddKeyDialogProps> = ({
  open,
  name,
  error,
  isSaving,
  onClose,
  onSubmit,
}) => (
  <Dialog
    open={open}
    onOpenChange={(next) => {
      if (!next) onClose()
    }}
  >
    <DialogContent className="max-w-[480px] gap-0 rounded-3xl border-secondary bg-surface p-0">
      {/* Remounts the form when the target changes underneath an open dialog, so a draft
          value can never be committed to the wrong key. */}
      <KeyForm
        key={name ?? '__new__'}
        name={name}
        error={error}
        isSaving={isSaving}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </DialogContent>
  </Dialog>
)

const KeyForm: FC<Omit<AddKeyDialogProps, 'open'>> = ({
  name,
  error,
  isSaving,
  onClose,
  onSubmit,
}) => {
  const [draftName, setDraftName] = useState('')
  const [draftValue, setDraftValue] = useState('')
  const nameId = useId()
  const valueId = useId()

  const nameOk = name !== undefined || isValidKeyName(draftName)
  const canSubmit = nameOk && draftValue.trim().length > 0 && !isSaving

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(name ?? draftName, draftValue)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-heading-xs text-primary">
          {name === undefined ? 'Add key' : `Replace ${name}`}
        </DialogTitle>
        <DialogDescription className="text-label-md text-tertiary">
          {name === undefined
            ? 'Written to the workspace vault, where every employee on the roster can reach it.'
            : 'The new value replaces the old one for the whole roster. The old value is not kept.'}
        </DialogDescription>
      </div>

      {name === undefined && (
        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className="text-label-sm font-medium text-secondary">
            Key name
          </label>
          <input
            id={nameId}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="OPENAI_API_KEY"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value.toUpperCase())}
            className={cn(FIELD, 'font-mono')}
          />
          {draftName.length > 0 && !nameOk && (
            <p className="text-label-xs text-critical">
              A name must start with a letter or underscore and contain only letters, digits
              and underscores.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor={valueId} className="text-label-sm font-medium text-secondary">
          Value
        </label>
        <input
          id={valueId}
          type="password"
          autoFocus={name !== undefined}
          autoComplete="off"
          placeholder="Paste the value"
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          className={FIELD}
        />
      </div>

      {error && (
        <p role="alert" className="text-label-sm text-critical">
          {error}
        </p>
      )}

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          Save
        </Button>
      </DialogFooter>
    </form>
  )
}
