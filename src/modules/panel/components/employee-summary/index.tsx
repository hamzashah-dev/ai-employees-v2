import type { FC, ReactNode } from 'react'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { toDisplayName } from '@/modules/core/utils/identity'
import { useEmployeeProfile } from '../../hooks/use-employee-profile'
import { SkeletonBar } from '../skeleton-bar'

interface EmployeeSummaryProps {
  profile: string
}

/** Who this employee is: mascot, name, what it is for, and what it runs on. */
export const EmployeeSummary: FC<EmployeeSummaryProps> = ({ profile }) => {
  const { data, isPending, isError } = useEmployeeProfile(profile)

  return (
    <section aria-label="Employee" className="flex items-start gap-3 px-4 py-4">
      <EmployeeAvatar profile={profile} size={40} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <h2 className="truncate text-label-md font-medium text-[rgb(var(--color-ink-7))]">
          {toDisplayName(profile)}
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
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-2.5 w-28" />
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
        <p className="text-label-sm text-[rgb(var(--color-ink-6))]">{summary}</p>
      ) : (
        <Tertiary>No description yet.</Tertiary>
      )}
      {modelName ? (
        <p className="truncate font-mono text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">
          {modelName}
        </p>
      ) : (
        <p className="text-label-sm text-[rgb(var(--color-warning))]">
          No model configured
        </p>
      )}
    </>
  )
}

const Tertiary: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">{children}</p>
)
