import { useEffect, useRef, useState, type FC, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckIcon } from '@repo/icons/check'
import { LinkIcon } from '@repo/icons/link-icon'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { WithTooltip } from '@repo/ui/tooltip'
import { Spinner } from '@/modules/core/components/spinner'
import { profileEnvKey } from '../../hooks/use-agent-detail'
import { setProfileEnvVar } from '../../services/profile-env'
import type { RequirementRow as Row } from '../../utils/requirements'

/**
 * Hand-rolled because `@repo/ui` ships no text field — `packages/ui/src` contains
 * no `<input>` or `<textarea>` anywhere. Sized and coloured off the token layer so
 * it still reads as the same product.
 */
const FIELD =
  'h-8 w-full min-w-0 rounded-xl border border-secondary bg-fill px-2.5 text-label-md text-primary placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:text-disabled'

const CONNECTOR_TOOLTIP =
  'Connecting a service is not wired in this build. Hermes has no connector store — its only integration surface is MCP — so nothing here can grant an agent access to your account.'

const PRE_HIRE_TOOLTIP =
  'Keys are stored on the employee, and the employee does not exist until you hire. Hire first and this field goes live.'

interface RequirementRowProps {
  row: Row
  /** Hermes profile name — the employee the key is written to. */
  profile: string
  /** False before the hire: there is no profile to write a key to yet. */
  editable: boolean
  autoFocus?: boolean
}

/**
 * One line of "Needs from you" — the block that decides whether this screen is
 * honest.
 *
 * A `value` row is real end to end: `PUT /api/env` writes the named variable
 * into that profile's own `.env`, and the row only turns to "Added" after
 * `GET /api/env` reports `is_set` back. That refetch is deliberate rather than
 * optimistic — on a managed install `save_env_value` declines the write and
 * still answers 200, so trusting the response would tell a user they had
 * supplied a credential they had not.
 *
 * A `connector` row cannot be answered at all, so it offers no input and its
 * Connect control is disabled with the reason attached, in the accessible name
 * as well as the tooltip — a disabled button never takes focus, so a tooltip
 * alone never reaches a keyboard user.
 */
export const RequirementRow: FC<RequirementRowProps> = ({
  row,
  profile,
  editable,
  autoFocus,
}) => {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const field = useRef<HTMLInputElement>(null)
  const { name, why } = row.requirement

  /*
   * D18 asks for the outstanding field to be focused after the hire. The `autoFocus`
   * attribute will not do it: this input is mounted inside a dialog Radix has already
   * settled focus for, and React only honours `autoFocus` at mount — which happens
   * while the hire request is still in flight. Focusing from an effect runs after the
   * row has actually become the one being asked for.
   */
  useEffect(() => {
    if (autoFocus) field.current?.focus()
  }, [autoFocus])

  const save = useMutation({
    mutationFn: () => setProfileEnvVar(profile, name, value.trim()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileEnvKey(profile) }),
  })

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    if (value.trim()) save.mutate()
  }

  const fieldId = `requirement-${profile}-${name}`

  return (
    <li className="flex flex-col gap-2 border-b border-secondary py-3 last:border-b-0 tablet:flex-row tablet:items-start tablet:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <label
          htmlFor={row.state === 'uncheckable' ? undefined : fieldId}
          className={cn('text-label-md text-primary', {
            'font-robotoMono': row.state !== 'uncheckable',
          })}
        >
          {name}
        </label>
        <p className="text-label-sm text-tertiary">{why}</p>
        {save.isError && (
          <p role="alert" className="text-label-sm text-critical">
            {save.error.message || 'Could not save that.'}
          </p>
        )}
      </div>

      <div className="flex w-full shrink-0 items-center gap-2 tablet:w-[280px]">
        {row.state === 'satisfied' && (
          <span className="flex items-center gap-1.5 text-label-md text-success">
            <CheckIcon className="size-3.5" />
            Added
          </span>
        )}

        {row.state === 'uncheckable' && (
          <WithTooltip
            content={CONNECTOR_TOOLTIP}
            size="sm"
            showArrow={false}
            className="inline-flex"
            tooltipContentProps={{ side: 'top', sideOffset: 6, className: 'max-w-64' }}
          >
            <Button
              variant="outline"
              size="sm"
              disabled
              aria-label={`Connect ${name} — not available in this build`}
            >
              <LinkIcon />
              Connect
            </Button>
          </WithTooltip>
        )}

        {row.state === 'outstanding' &&
          (editable ? (
            <form onSubmit={submit} className="flex w-full items-center gap-2">
              <input
                ref={field}
                id={fieldId}
                type={row.isPassword ? 'password' : 'text'}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={row.isPassword ? 'Paste the value' : 'Add a value'}
                className={FIELD}
              />
              <Button
                type="submit"
                variant="tertiary"
                size="sm"
                disabled={!value.trim() || save.isPending}
              >
                {save.isPending ? <Spinner className="size-3.5" /> : 'Add'}
              </Button>
            </form>
          ) : (
            <WithTooltip
              content={PRE_HIRE_TOOLTIP}
              size="sm"
              showArrow={false}
              className="inline-flex w-full"
              tooltipContentProps={{ side: 'top', sideOffset: 6, className: 'max-w-64' }}
            >
              <input
                id={fieldId}
                disabled
                placeholder="Added after you hire"
                aria-label={`${name} — added after you hire`}
                className={FIELD}
              />
            </WithTooltip>
          ))}
      </div>
    </li>
  )
}
