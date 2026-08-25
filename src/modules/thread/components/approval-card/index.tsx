import type { FC } from 'react'
import { Button } from '@/modules/core/components/button'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { ApprovalRequest } from '@/modules/core/types/chat'

interface ApprovalCardProps {
  profile: string
  approval: ApprovalRequest
}

/**
 * "Needs a yes" — the one moment the thread stops and waits for the reader.
 *
 * Both buttons only clear the request locally: Hermes exposes no approval RPC
 * yet, so nothing is sent back to the agent. That is stated in the card rather
 * than hidden, because a person who believes they approved a spend and did not
 * is worse off than one who knows the control is inert.
 */
export const ApprovalCard: FC<ApprovalCardProps> = ({ profile, approval }) => {
  const dismiss = (): void => useChatStore.getState().clearApproval(profile)

  return (
    <section
      aria-label="Approval request"
      className="rounded-[16px] bg-[rgb(var(--color-brand-deep))] p-4"
    >
      <p className="text-label-sm font-medium text-[rgb(var(--color-brand-soft))]">
        Needs a yes
      </p>

      <p className="mt-2 text-body text-[rgb(var(--color-ink-7))]">{approval.summary}</p>

      {approval.detail && (
        <p className="mt-2 font-mono text-label-sm break-words text-[rgb(var(--color-brand-soft))]">
          {approval.detail}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button variant="primary" size="md" onClick={dismiss}>
          Approve
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={dismiss}
          className="text-[rgb(var(--color-brand-soft))] hover:bg-[rgb(var(--color-brand)/0.25)] hover:text-[rgb(var(--color-ink-7))]"
        >
          Not now
        </Button>
      </div>

      <p className="mt-3 text-label-sm text-[rgb(var(--color-brand-soft)/0.7)]">
        Either answer only dismisses this card here — approvals are not sent back to the agent
        yet.
      </p>
    </section>
  )
}
