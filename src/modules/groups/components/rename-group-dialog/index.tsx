import { useId, useState } from 'react'
import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@repo/ui/dialog'
import { GROUP_FIELD } from '../../constants'

interface RenameGroupDialogProps {
  open: boolean
  onClose: () => void
  onRename: (name: string) => void
  name: string
}

/**
 * Renaming a room (§1f's third action).
 *
 * The id is not the name — sessions are titled from the id — so this is pure
 * relabelling and nothing downstream has to be migrated. `key={name}` remounts the
 * form when the room changes underneath an open dialog, which is what keeps a
 * stale draft from being committed to the wrong room.
 */
export const RenameGroupDialog: FC<RenameGroupDialogProps> = ({
  open,
  onClose,
  onRename,
  name,
}) => (
  <Dialog
    open={open}
    onOpenChange={(next) => {
      if (!next) onClose()
    }}
  >
    <DialogContent className="max-w-[480px] gap-0 rounded-3xl border-secondary bg-surface p-0">
      <RenameForm key={name} name={name} onClose={onClose} onRename={onRename} />
    </DialogContent>
  </Dialog>
)

const RenameForm: FC<Omit<RenameGroupDialogProps, 'open'>> = ({ name, onClose, onRename }) => {
  const [value, setValue] = useState(name)
  const fieldId = useId()
  const trimmed = value.trim()

  const commit = () => {
    if (!trimmed) return
    onRename(trimmed)
    onClose()
  }

  return (
    <form
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault()
        commit()
      }}
    >
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-heading-xs text-primary">Rename group</DialogTitle>
        <DialogDescription className="text-label-md text-tertiary">
          Everyone in it can see the name. You can change it later.
        </DialogDescription>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId} className="text-label-sm font-medium text-secondary">
          Group name
        </label>
        <input
          id={fieldId}
          value={value}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => setValue(event.target.value)}
          className={GROUP_FIELD}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!trimmed}>
          Save
        </Button>
      </DialogFooter>
    </form>
  )
}
