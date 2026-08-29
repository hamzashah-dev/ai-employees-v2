import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileEnv } from '@/modules/core/hooks/use-profile-env'
import { ROUTES } from '@/modules/roster/constants'
import type { CatalogAgent } from '../../../../constants/catalog'
import { useInstallAgent } from '../../../../hooks/use-install-agent'
import { useInstalledAgents } from '../../../../hooks/use-installed-agents'
import {
  firstOutstanding,
  progressLabel,
  summariseRequirements,
  type RequirementSummary,
} from '../../utils/requirements'

export interface AgentDetail {
  /** On the roster already — either from before, or from the hire just made. */
  employed: boolean
  /** True only for a hire made on this screen, which is what D18/D19 turn on. */
  justHired: boolean
  hire: () => void
  isHiring: boolean
  /** Hermes' own message on a name collision or a bad slug. */
  hireError?: string
  summary: RequirementSummary
  /**
   * Set when the key store could not be read. The rows below it are then a
   * guess, not a reading, and the screen has to say so.
   */
  envError?: string
  progress?: string
  /** The row D18 focuses — the first thing still missing. */
  focusName?: string
  close: () => void
  openThread: () => void
}

/**
 * D17/D18/D19, which are one screen and two transitions rather than three
 * screens.
 *
 * The hire itself is unconditionally real and always succeeds or fails on its
 * own merits: `POST /api/profiles` creates the profile, and the profile *is*
 * the employee — there is no second install step and nothing to gate. What the
 * requirements decide is only where the user lands afterwards:
 *
 * - something checkable still missing → stay for D18's receipt. The employee is
 *   already on the roster; the panel says so and shows what is still needed.
 * - nothing missing → fall through to D19, the employee's own thread.
 *
 * The same rule fires again when the last outstanding key is answered on the
 * receipt, which is what makes finishing the checklist walk you into the thread.
 */
export function useAgentDetail(agent: CatalogAgent): AgentDetail {
  const navigate = useNavigate()
  const installed = useInstalledAgents()
  const install = useInstallAgent(agent)

  // The roster refetch that follows a successful POST says the same thing a
  // moment later; reading the mutation too closes the gap between them.
  const employed = installed.has(agent.id) || install.isSuccess

  /*
   * Only asked for once the employee exists: `GET /api/env?profile=` 404s on a
   * profile that does not, and a 404 is one of the statuses the app declines to
   * retry. `summariseRequirements` reads `undefined` as "no store yet", which is
   * the same answer a brand-new profile gives.
   */
  const env = useProfileEnv(agent.id, { enabled: employed })

  const summary = useMemo(
    () => summariseRequirements(agent.requirements, env.data),
    [agent.requirements, env.data],
  )

  const openThread = (): void => {
    /*
     * The confirmation strip's line travels as router state rather than as an
     * import: `modules/thread` may not reach into another feature's constants,
     * so it renders whatever sentence it is handed and knows nothing about the
     * catalog. Router state also evaporates on reload, which is right for a
     * one-time beat.
     */
    navigate(`${ROUTES.EMPLOYEES}/${encodeURIComponent(agent.id)}`, {
      state: {
        hired: `${agent.name} is on your team. ${agent.howItWorks?.[0] ?? agent.tagline}`,
      },
    })
  }

  const justHired = install.isSuccess
  /*
   * A failed read is not an answer. Without `!env.isError` the summary would be
   * built from `undefined` — every value row "outstanding", `held` false — and
   * the panel would walk the user straight into the thread past a checklist it
   * never managed to check.
   */
  const settled = employed && !env.isPending && !env.isError
  const held = summary.held

  useEffect(() => {
    if (justHired && settled && !held) openThread()
    // `openThread` closes over `navigate` and `agent`, both stable for this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justHired, settled, held])

  return {
    employed,
    justHired,
    hire: () => install.mutate(),
    isHiring: install.isPending,
    hireError: install.isError ? install.error.message || 'Hire failed.' : undefined,
    summary,
    envError: env.isError ? env.error.message || 'Could not read its keys.' : undefined,
    progress: progressLabel(summary),
    focusName: firstOutstanding(summary)?.requirement.name,
    close: () => navigate(ROUTES.EMPLOYEES),
    openThread,
  }
}
