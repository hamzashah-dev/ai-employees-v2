import { useState, type FC } from 'react'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { Skeleton } from '@repo/ui/skeleton'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { AppearanceDialog } from '@/modules/core/components/identity-editor'
import { ModelPicker } from '@/modules/core/components/model-picker'
import { useDisplayName } from '@/modules/core/hooks/use-identity'
import { useEmployeeProfile } from '@/modules/core/hooks/use-employee-profile'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { describeEmployeeState } from '@/modules/core/utils/employee-state'

interface IdentityBlockProps {
  profile: string
}

const DOT_TONE = {
  success: 'bg-fill-success',
  warning: 'bg-fill-warning',
  critical: 'bg-fill-critical',
  neutral: 'bg-fill-variant-active',
} as const

/**
 * Who this employee is, at the top of the panel.
 *
 * The whole of the old info modal's Info page, minus everything that wrote: name, state,
 * model and description, in the order the canvas puts them. What is left of the writing is
 * the model picker, and it stays inline for the reason the canvas gives — it is the one
 * control here that changes what the next turn actually does.
 *
 * The avatar is the handle for the rest. Clicking it opens the appearance dialog, which is
 * where colour, shape and the display name went when this surface became read-only. There is
 * no standing pencil: the panel is open beside every conversation, and a permanent edit
 * affordance on a decoration would be the loudest thing in it.
 *
 * `Stop` appears only while a turn is in flight, because it is the only moment it means
 * anything. It is the store's own `stop`, the same interrupt the composer sends.
 */
export const IdentityBlock: FC<IdentityBlockProps> = ({ profile }) => {
  const [editing, setEditing] = useState(false)
  const displayName = useDisplayName(profile)
  const { data, isPending, isError } = useEmployeeProfile(profile)

  const status = useChatStore((state) => state.threads[profile]?.status)
  const statusText = useChatStore((state) => state.threads[profile]?.statusText)
  const connection = useChatStore((state) => state.connection)
  const stop = useChatStore((state) => state.stop)

  const state = describeEmployeeState(status, connection)
  const model = data?.model?.trim() || null
  const description = data?.description?.trim()
  const isWorking = status === 'working'

  return (
    <section aria-label="Employee" className="flex flex-col gap-3">
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          aria-label={`Edit ${displayName}’s appearance`}
          aria-haspopup="dialog"
          onClick={() => setEditing(true)}
          className="shrink-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <EmployeeAvatar profile={profile} size={48} busy={isWorking} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <h2 className="truncate text-heading-xs font-medium text-primary">
            {displayName}
          </h2>
          <p className="flex min-w-0 items-center gap-1.5 text-label-sm text-secondary">
            <span
              aria-hidden
              className={cn('size-1.5 shrink-0 rounded-full', DOT_TONE[state.tone])}
            />
            <span className="shrink-0">{state.label}</span>
            <span aria-hidden className="shrink-0 text-tertiary">
              ·
            </span>
            <ModelPicker profile={profile} model={model} />
          </p>
        </div>

        {isWorking && (
          <Button
            variant="outline"
            size="sm"
            shape="pill"
            className="shrink-0"
            onClick={() => void stop(profile)}
          >
            Stop
          </Button>
        )}
      </div>

      {/*
        What the employee is doing wins over what it is for, and only while it is doing it.
        `statusText` is free text off `status.update` — "Researching 14 prospects" — and it
        is the one line here that changes within a turn.
      */}
      <Description
        isPending={isPending}
        isError={isError}
        found={data !== undefined}
        text={(isWorking && statusText?.trim()) || description}
      />

      {editing && (
        <AppearanceDialog profile={profile} open={editing} onOpenChange={setEditing} />
      )}
    </section>
  )
}

interface DescriptionProps {
  isPending: boolean
  isError: boolean
  found: boolean
  text: string | undefined
}

const Description: FC<DescriptionProps> = ({ isPending, isError, found, text }) => {
  if (isPending) return <Skeleton className="h-4 w-full bg-fill-elevated" />

  // A failed roster call is not the same as a profile with nothing on it, so neither case is
  // allowed to borrow the other's copy.
  if (isError) {
    return <p className="text-label-md text-tertiary">Couldn’t load this employee’s details.</p>
  }
  if (!found) {
    return <p className="text-label-md text-tertiary">This employee is no longer on the roster.</p>
  }

  return (
    <p className="text-label-md text-secondary">{text || 'No description yet.'}</p>
  )
}
