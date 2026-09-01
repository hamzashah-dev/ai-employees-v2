import type { FC, KeyboardEvent } from 'react'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@repo/ui/dialog'
import { BotMark } from '@/modules/core/components/bot-avatar'
import { AppearanceTray } from './components/appearance-tray'
import { useIdentityEditor } from './hooks/use-identity-editor'

export { useIdentityEditor } from './hooks/use-identity-editor'
export type { UseIdentityEditorResult } from './hooks/use-identity-editor'

interface AppearanceDialogProps {
  profile: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * The employee's face and the name over it.
 *
 * This is everything the old info modal let you *write* except the model, lifted out whole:
 * the panel that replaced that modal is a read-only surface by design, and the one control
 * that writes to Hermes — the model picker — stays inline there because it changes the next
 * turn. Colour, shape and name change nothing on disk, so they belong behind a deliberate
 * open rather than in the panel's standing chrome.
 *
 * All of it is per-device. Hermes stores no avatar, colour or display name and has nowhere
 * to put one (`stores/identity-store` has the receipts), which the tray says out loud.
 *
 * The profile slug is deliberately not editable and never will be: renaming the directory
 * would orphan every session row, cron job and MCP config keyed by the old name, and Hermes
 * exposes no rename endpoint at all. A name typed here is a label over the slug.
 */
export const AppearanceDialog: FC<AppearanceDialogProps> = ({
  profile,
  open,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {/* `aria-describedby={undefined}` is Radix's way of saying there is no description,
        rather than leaving it to warn about the missing one. */}
    <DialogContent
      aria-describedby={undefined}
      className="max-w-[440px] gap-0 rounded-3xl border-secondary bg-surface p-5"
    >
      {/* Mounted only while open, so a draft name never survives a close. */}
      <AppearanceForm profile={profile} onDone={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)

const AppearanceForm: FC<{ profile: string; onDone: () => void }> = ({
  profile,
  onDone,
}) => {
  const editor = useIdentityEditor(profile)

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') editor.commitName()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <DialogTitle className="text-label-lg text-primary">Appearance</DialogTitle>
        <DialogCloseButton className="rounded-[10px] text-secondary" />
      </div>

      <div className="flex items-center gap-4">
        {/* Labelled by the slug, like every other avatar in the app, so a rename does not
            change what assistive tech calls the same employee in two places. */}
        <BotMark
          shape={editor.shape}
          color={editor.color}
          prop={editor.prop}
          size={72}
          label={`${profile} avatar`}
          className="shrink-0 drop-shadow-[0_9px_9px_rgba(0,0,0,0.6)]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor={`${profile}-name`} className="text-label-xs uppercase text-tertiary">
            Name
          </label>
          <input
            id={`${profile}-name`}
            value={editor.draftName}
            placeholder={editor.placeholder}
            onChange={(event) => editor.setDraftName(event.target.value)}
            onKeyDown={onKeyDown}
            /* Committed on blur as well as Enter: the swatches below are the next thing a
               pointer lands on, and a name typed and then abandoned mid-edit is a name the
               user meant. */
            onBlur={editor.commitName}
            className="w-full rounded-xl border border-secondary bg-fill-elevated px-2.5 py-1.5 text-label-md text-primary outline-none placeholder:text-tertiary focus-visible:border-primary"
          />
        </div>
      </div>

      <AppearanceTray editor={editor} onDone={onDone} />
    </div>
  )
}
