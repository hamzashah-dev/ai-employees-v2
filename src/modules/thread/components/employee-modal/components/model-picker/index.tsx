import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { DropdownIcon } from '@repo/icons/dropdown-icon'
import { cn } from '@repo/ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { Spinner } from '@/modules/core/components/spinner'
import { useModelPicker } from './hooks/use-model-picker'

interface ModelPickerProps {
  profile: string
  /** The model the profile row currently reports, or null if Hermes has none set. */
  model: string | null
}

/**
 * What this employee runs on, and the control that changes it.
 *
 * Sits inline on the state line rather than in a row of its own: the model is an
 * attribute of the employee, like its state, and giving it a labelled field
 * would make the quietest fact in the modal the loudest thing in it.
 *
 * Deliberately a plain text trigger at the state line's own size and colour — it
 * reads as the same sentence until you go near it. The chevron is the only
 * standing hint that it is live.
 */
export const ModelPicker: FC<ModelPickerProps> = ({ profile, model }) => {
  const picker = useModelPicker(profile)

  return (
    <DropdownMenu open={picker.isOpen} onOpenChange={picker.setIsOpen}>
      <DropdownMenuTrigger
        aria-label={model ? `Model: ${model}. Change model` : 'Set a model'}
        className={cn(
          'flex min-w-0 cursor-pointer items-center gap-1 rounded-lg px-1.5 py-0.5 -mx-1.5',
          'text-label-sm text-tertiary transition-colors',
          'hover:bg-fill-variant-hover hover:text-secondary',
          'focus-visible:bg-fill-variant-hover focus-visible:text-secondary focus-visible:outline-none',
          'data-[state=open]:bg-fill-variant-active data-[state=open]:text-primary',
        )}
      >
        <span className="truncate">{model ?? 'Set a model'}</span>
        <DropdownIcon className="size-2 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="bottom"
        className="flex w-72 flex-col gap-1 rounded-2xl border border-primary bg-surface p-2 shadow-sm"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <input
          autoFocus
          aria-label="Search models"
          placeholder="Search models"
          value={picker.query}
          onChange={(event) => picker.setQuery(event.target.value)}
          // Radix DropdownMenu treats printable keys as typeahead and steals focus
          // to the matching item, so an unguarded input takes one character and
          // then stops. Keeping the keys to the field is what makes it typable.
          onKeyDown={(event) => event.stopPropagation()}
          className="w-full shrink-0 rounded-xl border border-secondary bg-fill-elevated px-2.5 py-1.5 text-label-md text-primary outline-none placeholder:text-tertiary focus-visible:border-primary"
        />

        <div className="scrollbar-minimal flex max-h-72 flex-col overflow-y-auto">
          {picker.isLoading && (
            <div className="flex items-center gap-2 px-2.5 py-2 text-label-md text-secondary">
              <Spinner />
              Loading models…
            </div>
          )}

          {picker.error && (
            <p role="alert" className="px-2.5 py-2 text-label-md text-critical">
              {picker.error.message}
            </p>
          )}

          {!picker.isLoading && !picker.error && picker.groups.length === 0 && (
            <p className="px-2.5 py-2 text-label-md text-secondary">
              {picker.totalCount === 0
                ? 'No authenticated providers. Add one in the Hermes dashboard.'
                : `No model matches “${picker.query}”.`}
            </p>
          )}

          {picker.groups.map((group) => (
            <div key={group.provider} className="flex flex-col">
              <p className="px-2.5 pt-2 pb-1 text-label-xs text-tertiary">{group.label}</p>
              {group.models.map((option) => (
                <DropdownMenuItem
                  key={`${option.provider}/${option.model}`}
                  onSelect={(event) => event.preventDefault()}
                  onClick={() => picker.choose(option)}
                  disabled={picker.pendingModel !== undefined}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-label-md text-primary"
                >
                  <span className="truncate">{option.model}</span>
                  {picker.pendingModel === option.model ? (
                    <Spinner />
                  ) : (
                    <CheckIcon
                      className={cn('size-4 shrink-0 text-primary', {
                        invisible: option.model !== model,
                      })}
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </div>

        {picker.saveError && (
          <p role="alert" className="px-2.5 pt-1 text-label-xs text-critical">
            {picker.saveError}
          </p>
        )}

        {/*
          Hermes reads `model.default` when a turn starts, so a change lands on the
          next message rather than on one already running — the same contract the
          connectors list has, and worth saying for the same reason.
        */}
        <p className="px-2.5 pt-1 text-label-xs text-tertiary">
          Applies from the next message.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
