import type { AgentRequirement } from '../../../../constants/catalog'
import type { ProfileEnv } from '@/modules/core/services/hermes/rest'

/**
 * Whether the backend can answer this row, and what it answered.
 *
 * `uncheckable` is the honest third state and it exists because Hermes has no
 * connector registry. Its only integration surfaces are MCP (a fixed catalogue
 * of `blender` / `linear` / `n8n` / `unreal-engine`) and the messaging-gateway
 * channels — and the nearest thing to a "connected" flag,
 * `GET /api/messaging/platforms?profile=`, answers a *different* question: it
 * says whether the gateway can receive Slack/Discord/WhatsApp messages for that
 * profile, not whether this agent may act on the user's Slack. Using it as a
 * proxy would put a green check against a capability nobody granted, so a
 * connector row states the need and stops there.
 *
 * A `value` row is fully real: the name is an environment variable, its state
 * is `is_set` from `GET /api/env?profile=`, and `PUT /api/env` writes it.
 */
export type RequirementState = 'satisfied' | 'outstanding' | 'uncheckable'

export interface RequirementRow {
  requirement: AgentRequirement
  state: RequirementState
  /** Hermes' own `is_password`, so a token field masks and a sheet id does not. */
  isPassword: boolean
}

export interface RequirementSummary {
  rows: RequirementRow[]
  /** Rows the backend can actually answer — the denominator of the progress line. */
  checkable: number
  answered: number
  /**
   * The employee exists and something checkable is still missing. This is the
   * whole of D18's "held": derived from a real read, never a local flag.
   */
  held: boolean
}

/**
 * @param env  The employee's key store, or `undefined` when there is no
 *   employee yet (nothing is hired) or the read has not landed. A freshly
 *   created profile genuinely starts empty — `POST /api/profiles` is sent
 *   without `clone_from`, and `create_profile` only copies a source `.env` when
 *   asked — so "no employee" and "nothing set" are the same answer, and the
 *   pre-hire screen is not guessing when it shows every value row outstanding.
 */
export function summariseRequirements(
  requirements: readonly AgentRequirement[] | undefined,
  env: ProfileEnv | undefined,
): RequirementSummary {
  const rows: RequirementRow[] = (requirements ?? []).map((requirement) => {
    if (requirement.satisfiedBy === 'connector') {
      return { requirement, state: 'uncheckable', isPassword: false }
    }

    const known = env?.[requirement.name]
    return {
      requirement,
      state: known?.isSet === true ? 'satisfied' : 'outstanding',
      isPassword: known?.isPassword === true,
    }
  })

  const checkable = rows.filter((row) => row.state !== 'uncheckable').length
  const answered = rows.filter((row) => row.state === 'satisfied').length

  return {
    rows,
    checkable,
    answered,
    held: env !== undefined && answered < checkable,
  }
}

/**
 * D18's progress line. Undefined when there is nothing to count, so the receipt
 * omits the line rather than reading "0 of 0".
 */
export function progressLabel(summary: RequirementSummary): string | undefined {
  if (summary.checkable === 0) return undefined
  return `${summary.answered} of ${summary.checkable} answered`
}

/** The first row still waiting — the field D18 focuses. */
export function firstOutstanding(summary: RequirementSummary): RequirementRow | undefined {
  return summary.rows.find((row) => row.state === 'outstanding')
}
