import type { FC, ReactNode } from 'react'
import { Skeleton } from '@repo/ui/skeleton'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { useDisplayName } from '@/modules/core/hooks/use-identity'
import { useEmployeeProfile } from '@/modules/core/hooks/use-employee-profile'

interface EmployeeSummaryProps {
  profile: string
}

/**
 * Who this employee is: mascot, name, what it is for, and what it runs on.
 *
 * The canvas's panel has no such block — it draws the screen and the routines
 * and stops. This is the one thing here the design does not specify, so it sits
 * last, below everything the canvas does specify, behind a hairline.
 */
export const EmployeeSummary: FC<EmployeeSummaryProps> = ({ profile }) => {
  const { data, isPending, isError } = useEmployeeProfile(profile)
  const displayName = useDisplayName(profile)

  return (
    <section
      aria-label="Employee"
      className="flex items-start gap-2.5 border-t border-primary px-1 pt-3"
    >
      <EmployeeAvatar profile={profile} className="size-10" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <h2 className="truncate text-label-md font-medium text-primary">
          {displayName}
        </h2>
        <Details
          isPending={isPending}
          isError={isError}
          found={data !== undefined}
          description={data?.description}
          model={data?.model}
        />
      </div>
    </section>
  )
}

interface DetailsProps {
  isPending: boolean
  isError: boolean
  found: boolean
  description: string | undefined
  model: string | null | undefined
}

const Details: FC<DetailsProps> = ({ isPending, isError, found, description, model }) => {
  if (isPending) {
    return (
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-full bg-fill-elevated" />
        <Skeleton className="h-2.5 w-28 bg-fill-elevated" />
      </div>
    )
  }

  // A failed roster call is not the same as a profile with nothing on it, so
  // neither case is allowed to borrow the other's copy.
  if (isError) return <Tertiary>Couldn’t load this employee’s details.</Tertiary>
  if (!found) return <Tertiary>This employee is no longer on the roster.</Tertiary>

  const summary = description?.trim()
  const modelName = model?.trim()

  return (
    <>
      {summary ? (
        <p className="text-label-sm text-secondary">{summary}</p>
      ) : (
        <Tertiary>No description yet.</Tertiary>
      )}
      {modelName ? (
        <p className="truncate font-mono text-label-sm text-tertiary">{modelName}</p>
      ) : (
        <p className="text-label-sm text-warning">No model configured</p>
      )}
    </>
  )
}

const Tertiary: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-label-sm text-tertiary">{children}</p>
)
