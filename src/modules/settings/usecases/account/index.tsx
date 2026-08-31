import { useId } from 'react'
import type { FC } from 'react'
import { cn } from '@repo/ui/cn'
import { AccountAvatar } from '@/modules/core/components/account-avatar'
import { ACCOUNT_NAME, ACCOUNT_PLAN } from '@/modules/core/constants/account'
import { MemoryList } from './components/memory-list'
import { SystemCard } from './components/system-card'
import { useAccountSettings } from './hooks/use-account-settings'
import type { MemoryWritesSwitch as MemoryWritesSwitchModel } from './hooks/use-account-settings'

/**
 * Screen 2a — Settings › Account: who this install thinks you are, what every employee
 * knows about you, and the machine they run on.
 *
 * The identity row is **read-only, and says so.** Hermes has no user-identity endpoint —
 * `/api/status` describes the install, not a person — so the name and plan are the shared
 * `ACCOUNT_NAME` / `ACCOUNT_PLAN` constants in `modules/core`, the same two the sidebar
 * footer and the top bar read. The canvas' own annotation is the honest caption and is used
 * verbatim: an "Edit" affordance here could only write to a constant, i.e. nowhere.
 *
 * Everything below it is real: `GET`/`PUT /api/memory/file` back the memory list and
 * `GET /api/status` backs the system card. The one control that is not real — "Let employees
 * write memories" — is rendered disabled with the reason attached; see
 * {@link MemoryWritesSwitchModel}.
 */
export const AccountView: FC = () => {
  const { memory, system, memoryWrites } = useAccountSettings()
  const headingId = useId()
  const systemHeadingId = useId()

  return (
    <section aria-labelledby={headingId} className="flex min-h-0 flex-1 flex-col">
      <header className="flex-none px-5 pt-5 pb-1">
        <h2 id={headingId} className="text-label-lg text-primary">
          Account
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-3 pb-6">
        <div className="flex items-center gap-3">
          <AccountAvatar className="size-10 text-label-md" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-label-md text-primary">{ACCOUNT_NAME}</span>
            <span className="text-label-xs text-tertiary">
              {ACCOUNT_PLAN} · this Hermes install has no sign-in, so the name is set in code
            </span>
          </span>
        </div>

        <section aria-label="Memory" className="flex flex-col gap-0.5">
          <MemoryList
            entries={memory.entries}
            isLoading={memory.isLoading}
            errorMessage={memory.errorMessage}
            writeError={memory.writeError}
            isSaving={memory.isSaving}
            onAdd={memory.add}
            onUpdate={memory.update}
            onRemove={memory.remove}
            onDismissWriteError={memory.clearWriteError}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5">
            {/*
             * Not "takes effect on the next message". `MemoryStore.load_from_disk` runs at
             * agent init (`agent/agent_init.py:1889`) and the entries are then frozen into
             * the system-prompt snapshot for the whole session to keep the prefix cache
             * stable — only a context compression reloads them
             * (`agent/system_prompt.py:1036`). A thread that is already open therefore keeps
             * the memories it started with.
             */}
            <p className="max-w-[420px] text-label-xs text-tertiary">
              Every employee reads these when its session starts. An edit reaches a thread
              that is already open on its next session, not its next message.
            </p>

            <MemoryWritesSwitch model={memoryWrites} />
          </div>
        </section>

        <section aria-labelledby={systemHeadingId} className="flex flex-col gap-2">
          <h3 id={systemHeadingId} className="text-label-sm text-secondary">
            System · the machine every employee runs on
          </h3>

          <SystemCard
            isLoading={system.isLoading}
            errorMessage={system.errorMessage}
            version={system.version}
            gatewayRunning={system.gatewayRunning}
            overall={system.overall}
            computerHome={system.computerHome}
            employeeCount={system.employeeCount}
            disk={system.disk}
          />
        </section>
      </div>
    </section>
  )
}

/**
 * "Let employees write memories" — a real switch now.
 *
 * Bound to `auxiliary.background_review.enabled`, the master switch for the post-turn fork
 * that decides whether to save a memory. `role="switch"` with a real `aria-checked`, which
 * this control has earned: the value comes from `GET /api/config`'s defaulted record.
 *
 * While the config read is still pending there is genuinely no state to draw, so the switch
 * is disabled and `aria-checked` is omitted rather than guessed. A rejected write leaves the
 * knob where it was — the query is the only source of truth for its position — and the reason
 * is printed beside it instead of being swallowed.
 */
const MemoryWritesSwitch: FC<{ model: MemoryWritesSwitchModel }> = ({ model }) => {
  const { isEnabled, isLoading, isSaving, error, toggle } = model

  return (
    <span className="flex shrink-0 items-center gap-2">
      <span className="text-label-xs text-secondary">Let employees write memories</span>

      {error && (
        <span role="alert" className="max-w-[220px] text-label-xs text-critical">
          {error}
        </span>
      )}

      <button
        type="button"
        role="switch"
        {...(isLoading ? {} : { 'aria-checked': isEnabled })}
        aria-label="Let employees write memories"
        disabled={isLoading || isSaving}
        onClick={toggle}
        className={cn(
          'flex h-[22px] w-10 shrink-0 items-center rounded-full p-0.5 transition-colors',
          {
            'cursor-pointer': !isLoading && !isSaving,
            'cursor-default': isLoading || isSaving,
            'bg-fill-inverse': isEnabled && !isLoading,
            'bg-fill-tertiary': !isEnabled || isLoading,
            'justify-end': isEnabled && !isLoading,
            'justify-center': isLoading,
          },
        )}
      >
        <span
          aria-hidden="true"
          className={cn('size-[18px] rounded-full', {
            'bg-primary': isEnabled && !isLoading,
            'bg-fill-disabled': !isEnabled || isLoading,
          })}
        />
      </button>
    </span>
  )
}
