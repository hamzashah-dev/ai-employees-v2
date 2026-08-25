import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { ApprovalRequest } from '@/modules/core/types/chat'
import { WorkingPill } from '../working-pill'

interface ApprovalCardProps {
  profile: string
  approval: ApprovalRequest
  /** The employee is still mid-turn behind the question. */
  working: boolean
}

/**
 * "Needs a yes" — the one moment the thread stops and waits for the reader.
 *
 * Both buttons only clear the request locally: Hermes exposes no approval RPC
 * yet, so nothing is sent back to the agent. That is stated in the card rather
 * than hidden, because a person who believes they approved a spend and did not
 * is worse off than one who knows the control is inert.
 */
export const ApprovalCard: FC<ApprovalCardProps> = ({ profile, approval, working }) => {
  const dismiss = (): void => useChatStore.getState().clearApproval(profile)

  return (
    <section
      aria-label="Approval request"
      className="flex flex-col gap-2.5 rounded-2xl border border-primary bg-fill-elevated p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-md text-primary">{approval.summary}</p>
        {working && <WorkingPill />}
      </div>

      {approval.detail && (
        <p className="font-mono text-label-sm break-words text-tertiary">{approval.detail}</p>
      )}

      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={dismiss} className="h-9 rounded-2xl px-4">
          Approve
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismiss}
          className="h-9 rounded-2xl px-4 text-secondary"
        >
          Not now
        </Button>
      </div>

      <p className="text-label-sm text-tertiary">
        Either answer only dismisses this card here — approvals are not sent back to the agent
        yet.
      </p>
    </section>
  )
}
