import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@repo/ui/button'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { NeedsYesItem } from '../../utils/derive-sections'
import { DashboardSection } from '../dashboard-section'

interface NeedsYesProps {
  items: NeedsYesItem[]
}

/**
 * The one section that is a queue rather than a report.
 *
 * The canvas's primary action is the agent's own wording ("File as Meals"), which
 * no payload carries — `approval.request` gives a summary and an optional detail
 * line, and Hermes has no approval RPC to answer with. So the primary action is
 * the real one available: open the thread, where the approval card lives. "Decide
 * later" clears it here only, exactly as that card's own "Not now" does.
 */
export const NeedsYes: FC<NeedsYesProps> = ({ items }) => {
  if (items.length === 0) return null

  return (
    <DashboardSection title="Needs a yes" className="gap-2.5">
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <ApprovalCard key={item.profile} item={item} />
        ))}
      </div>
    </DashboardSection>
  )
}

const ApprovalCard: FC<{ item: NeedsYesItem }> = ({ item }) => (
  <article className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary bg-fill-elevated p-4">
    <EmployeeAvatar profile={item.profile} />

    <div className="flex min-w-0 flex-1 basis-[240px] flex-col gap-0.5">
      <p className="truncate text-label-md font-medium text-primary">{item.displayName}</p>
      <p className="text-body-sm text-primary">{item.question}</p>
      {item.meta && (
        <p className="font-robotoMono text-label-sm text-tertiary">{item.meta}</p>
      )}
    </div>

    <div className="flex shrink-0 items-center gap-2">
      <Button
        asChild
        variant="primary"
        size="none"
        className="h-9 rounded-2xl px-4 text-label-md font-medium"
      >
        <Link to={`/employees/${encodeURIComponent(item.profile)}`}>Open thread</Link>
      </Button>
      <Button
        variant="ghost"
        size="none"
        className="h-9 rounded-2xl px-4 text-label-md font-medium text-secondary"
        onClick={() => useChatStore.getState().clearApproval(item.profile)}
      >
        Decide later
      </Button>
    </div>
  </article>
)
