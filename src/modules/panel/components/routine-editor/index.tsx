import { useId, type FC, type ReactNode } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { TrashIcon } from '@repo/icons/trash'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  SegmentedControls,
  SegmentedControlsContent,
  SegmentedControlsList,
  SegmentedControlsTrigger,
} from '@repo/ui/segmented-controls'
import { Spinner } from '@/modules/core/components/spinner'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import {
  CADENCE_OPTIONS,
  WEEKDAY_OPTIONS,
  type CadenceKind,
} from '../../utils/cadence'
import { useRoutineEditor, type RoutineEditorState } from './hooks/use-routine-editor'

/**
 * `@repo/ui` ships no input or textarea primitive — there is not one `<input>`
 * in the whole package, only Radix wrappers around checkbox, switch, slider and
 * label — so the two text fields here are hand-rolled against the token layer
 * rather than borrowed. The focus treatment copies `buttonVariants` so a field
 * and a button focus alike.
 */
const FIELD =
  'w-full rounded-xl border border-primary bg-fill-elevated px-3 text-label-md text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:text-disabled'

interface RoutineEditorProps {
  profile: string
  /** Null when adding; a job when editing an existing routine. */
  job: HermesCronJob | null
  onDone: () => void
  onCancel: () => void
}

/**
 * Add or change one routine.
 *
 * The cadence control is Radix tabs rather than a radio group because the four
 * choices genuinely swap panels — Weekly needs a day, Custom needs a raw
 * expression, and Daily and Weekdays need neither — so the tab semantics
 * describe what is on screen instead of being borrowed for the look.
 */
export const RoutineEditor: FC<RoutineEditorProps> = ({
  profile,
  job,
  onDone,
  onCancel,
}) => {
  const editor = useRoutineEditor(profile, job, onDone)
  const nameId = useId()
  const timeId = useId()
  const dayId = useId()
  const expressionId = useId()
  const promptId = useId()
  const problemId = useId()

  const timeField = (
    <Field label="Time" htmlFor={timeId}>
      <input
        id={timeId}
        type="time"
        value={editor.cadence.time}
        onChange={(event) =>
          editor.setCadence({ ...editor.cadence, time: event.target.value })
        }
        className={cn(FIELD, 'h-10')}
      />
    </Field>
  )

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        editor.save()
      }}
    >
      <Field label="Name" htmlFor={nameId}>
        <input
          id={nameId}
          value={editor.name}
          onChange={(event) => editor.setName(event.target.value)}
          className={cn(FIELD, 'h-10')}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <SegmentedControls
          value={editor.cadence.kind}
          onValueChange={(value) =>
            editor.setCadence({ ...editor.cadence, kind: value as CadenceKind })
          }
        >
          <SegmentedControlsList
            aria-label="Cadence"
            variant="primary"
            size="sm"
            className="w-full"
          >
            {CADENCE_OPTIONS.map((option) => (
              <SegmentedControlsTrigger
                key={option.value}
                value={option.value}
                variant="secondary"
                size="sm"
              >
                {option.label}
              </SegmentedControlsTrigger>
            ))}
          </SegmentedControlsList>

          <SegmentedControlsContent value="daily" className="pt-3">
            {timeField}
          </SegmentedControlsContent>
          <SegmentedControlsContent value="weekdays" className="pt-3">
            {timeField}
          </SegmentedControlsContent>
          <SegmentedControlsContent value="weekly" className="flex gap-3 pt-3">
            <Field label="Day" htmlFor={dayId} className="flex-1">
              <select
                id={dayId}
                value={editor.cadence.weekday}
                onChange={(event) =>
                  editor.setCadence({
                    ...editor.cadence,
                    weekday: Number(event.target.value),
                  })
                }
                className={cn(FIELD, 'h-10')}
              >
                {WEEKDAY_OPTIONS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex-1">{timeField}</div>
          </SegmentedControlsContent>
          <SegmentedControlsContent value="custom" className="pt-3">
            <Field
              label="Cron expression"
              htmlFor={expressionId}
              hint="Five fields, the way cron writes them — minute, hour, day, month, weekday."
            >
              <input
                id={expressionId}
                value={editor.cadence.expression}
                spellCheck={false}
                onChange={(event) =>
                  editor.setCadence({ ...editor.cadence, expression: event.target.value })
                }
                className={cn(FIELD, 'h-10 font-mono')}
              />
            </Field>
          </SegmentedControlsContent>
        </SegmentedControls>

        {/* The schedule read back through the routine row's own formatter, so
            what you set here is literally what the row will say. */}
        <p className="text-label-sm text-tertiary">Runs {lower(editor.preview)}</p>
      </div>

      <Field label="Prompt" htmlFor={promptId}>
        <TextareaAutosize
          id={promptId}
          value={editor.prompt}
          onChange={(event) => editor.setPrompt(event.target.value)}
          minRows={4}
          maxRows={12}
          aria-describedby={editor.problem ? problemId : undefined}
          className={cn(
            FIELD,
            'scrollbar-minimal resize-none py-3 text-body-md placeholder:text-tertiary',
          )}
          placeholder="What should this employee do, cold, with no conversation behind it?"
        />
      </Field>

      {editor.problem && (
        <p id={problemId} role="alert" className="text-label-sm text-critical">
          {editor.problem}
        </p>
      )}

      <footer className="flex items-center justify-between gap-2 border-t border-primary pt-4">
        <RemoveControl remove={editor.remove} />

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={editor.isSaving}>
            {editor.isSaving && <Spinner />}
            {job ? 'Save routine' : 'Add routine'}
          </Button>
        </div>
      </footer>
    </form>
  )
}

/**
 * Delete, behind a confirmation.
 *
 * Two steps in place rather than a dialog: a routine is small enough that a
 * modal over the drawer is heavier than the decision, and the second click
 * lands on a button that has moved and changed its words, so it cannot be
 * reached by the momentum of the first.
 */
const RemoveControl: FC<{ remove: RoutineEditorState['remove'] }> = ({
  remove,
}) => {
  if (!remove) return <span />

  if (!remove.isConfirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-critical [&>svg]:size-4"
        onClick={remove.request}
      >
        <TrashIcon />
        Delete
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-label-sm text-secondary">Delete this routine?</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={remove.cancel}
        disabled={remove.isPending}
      >
        Keep
      </Button>
      <Button
        type="button"
        variant="error"
        size="sm"
        onClick={remove.confirm}
        disabled={remove.isPending}
      >
        {remove.isPending && <Spinner />}
        Delete
      </Button>
    </div>
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  className?: string
  children: ReactNode
}

const Field: FC<FieldProps> = ({ label, htmlFor, hint, className, children }) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <label htmlFor={htmlFor} className="text-label-sm font-medium text-secondary">
      {label}
    </label>
    {children}
    {hint && <p className="text-label-xs text-tertiary">{hint}</p>}
  </div>
)

/** "Every day at 8:00 AM" reads as a sentence once it follows "Runs". */
function lower(preview: string): string {
  return preview.charAt(0).toLowerCase() + preview.slice(1)
}
