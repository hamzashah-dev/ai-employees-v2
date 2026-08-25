import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@repo/ui/button'
import { AgentBlob } from '@/modules/core/components/agent-blob'
import { SUGGESTED_HIRES } from '../../constants/suggested-hires'

const MARKETPLACE = '/marketplace'

/**
 * D5 — a signed-in user who has hired nobody.
 *
 * §7 is explicit that this is "not a shrug": it says what an employee *is*
 * before it asks for a decision, and it names three real agents so the next
 * click is a specific one rather than a browse. The sidebar's own empty line
 * ("No employees on your team yet." over a "Hire your first employee" link) is
 * visible beside this, so nothing here repeats its wording.
 */
export const EmptyRoster: FC = () => (
  <section
    aria-label="No employees yet"
    className="flex flex-col items-center gap-6 py-10 text-center"
  >
    <div className="flex max-w-[560px] flex-col items-center gap-2">
      <h2 className="text-heading-sm font-medium text-primary">Your team is empty</h2>
      <p className="text-body-md text-secondary">
        An employee is a named agent with its own thread, its own computer and its own
        schedule, working while you are away and reporting back when it is done.
      </p>
    </div>

    <Button
      asChild
      variant="primary"
      size="none"
      className="h-10 rounded-2xl px-4 text-label-md font-medium"
    >
      <Link to={MARKETPLACE}>Browse the Marketplace</Link>
    </Button>

    <ul className="grid w-full max-w-[840px] grid-cols-1 gap-3 tablet:grid-cols-3">
      {SUGGESTED_HIRES.map((hire) => (
        <li key={hire.id} className="flex">
          <Link
            // The same target the marketplace's own cards use — D17's agent
            // detail. Written out rather than imported for the reason in
            // `constants/suggested-hires`: `ROUTES` is the roster module's.
            to={`${MARKETPLACE}/${hire.id}`}
            aria-label={`Hire ${hire.name}`}
            className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-primary bg-fill-elevated p-4 transition-colors duration-200 ease-linear hover:border-secondary"
          >
            <AgentBlob profile={hire.id} className="size-12" />
            <p className="w-full truncate text-label-lg font-medium text-primary">
              {hire.name}
            </p>
            <p className="line-clamp-2 text-label-sm text-tertiary">{hire.tagline}</p>
          </Link>
        </li>
      ))}
    </ul>
  </section>
)
