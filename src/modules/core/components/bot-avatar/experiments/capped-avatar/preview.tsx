import type { FC } from 'react'
import { getIdentity } from '@/modules/core/utils/identity'
import { BOT_COLORS } from '../../constants'
import { CappedAvatarExperiment } from '.'

/**
 * TEMPORARY — a grid of the capped-avatar experiment across every hue, real catalogue
 * profiles (their real colour + job glyph, via `getIdentity` — the same resolution the
 * roster and marketplace card use), and sizes, at `/dev/cap-experiment`. Not linked from any
 * nav. Delete alongside the route in `app/index.tsx` and this whole `experiments/` folder
 * once the direction is settled.
 */
const REAL_PROFILES = [
  'startup-kit-agent',
  'customer-support',
  'account-manager',
  'ops-reporter',
  'blog-drafter',
  'purchase-clerk',
]

export const CapExperimentPage: FC = () => (
  <div className="min-h-screen bg-primary p-8">
    <h1 className="mb-6 text-heading-sm text-primary">Capped avatar — experiment</h1>

    <h2 className="mb-3 text-label-lg text-secondary">
      96px, every hue, seed &quot;employee&quot;, prop &quot;idea&quot;
    </h2>
    <div className="mb-10 flex flex-wrap gap-6">
      {BOT_COLORS.map((c) => (
        <div key={c.name} className="flex flex-col items-center gap-2">
          <CappedAvatarExperiment
            color={c.name}
            seed="employee"
            prop="idea"
            size={96}
            label={c.name}
          />
          <span className="text-label-sm text-tertiary">{c.name}</span>
        </div>
      ))}
    </div>

    <h2 className="mb-3 text-label-lg text-secondary">
      Real catalogue profiles — their own colour + job glyph via `getIdentity`
    </h2>
    <div className="mb-10 flex flex-wrap gap-6">
      {REAL_PROFILES.map((profile) => {
        const identity = getIdentity(profile)
        return (
          <div key={profile} className="flex flex-col items-center gap-2">
            <CappedAvatarExperiment
              color={identity.color}
              seed={identity.seed}
              prop={identity.prop}
              size={96}
              label={profile}
            />
            <span className="text-label-sm text-tertiary">{profile}</span>
          </div>
        )
      })}
    </div>

    <h2 className="mb-3 text-label-lg text-secondary">Sizes, sky / employee / idea</h2>
    <div className="mb-10 flex flex-wrap items-end gap-6">
      {[24, 36, 48, 72, 96, 128].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <CappedAvatarExperiment
            color="sky"
            seed="employee"
            prop="idea"
            size={size}
            label={`${size}px`}
          />
          <span className="text-label-sm text-tertiary">{size}px</span>
        </div>
      ))}
    </div>

    <h2 className="mb-3 text-label-lg text-secondary">No prop (job unknown), and busy face</h2>
    <div className="flex flex-wrap gap-6">
      <CappedAvatarExperiment color="sky" seed="employee" size={96} label="no-prop" />
      <CappedAvatarExperiment color="sky" seed="employee" prop="idea" size={96} label="idle" />
      <CappedAvatarExperiment
        color="sky"
        seed="employee"
        prop="idea"
        size={96}
        busy
        label="busy"
      />
    </div>
  </div>
)
