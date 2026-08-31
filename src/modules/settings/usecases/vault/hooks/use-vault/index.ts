import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteProfileEnvVar,
  fetchGlobalEnv,
  revealProfileEnvVar,
  setProfileEnvVar,
  type ProfileEnv,
} from '@/modules/core/services/hermes/rest'

/** One row of the workspace vault, narrowed to what the table draws. */
export interface VaultKey {
  name: string
  /**
   * Hermes' own mask, never one computed here. `redact_key` keeps four characters at each
   * end (`sk-p...7890`) and returns `***` for anything short — which is why the table shows
   * whatever string arrives rather than a fixed `••••` plus a last-4 the listing never sends.
   */
  masked: string
  /** Catalogue prose for the key, or empty for one Hermes has never heard of. */
  description: string
  isPassword: boolean
  /** Owned by the Hermes dashboard's Channels page; listed here, not edited here. */
  channelManaged: boolean
}

/**
 * The cache entry for the workspace vault.
 *
 * Deliberately not `['profile-env', '']`: the per-employee hook in `modules/core` owns that
 * shape, and a shared prefix would make one surface's invalidation quietly refetch the
 * other's rows.
 */
export const GLOBAL_ENV_KEY = ['global-env'] as const

/**
 * The profile a workspace-scoped write names — none.
 *
 * There is no separate global-env endpoint. `_profile_scope` treats `None`/`""`/`"current"`
 * as "the dashboard's own home" (`computer_cli/web_server.py:15294`), so the three
 * per-employee writers, called with an empty profile, land in `<COMPUTER_HOME>/.env`
 * instead of inside one employee's directory.
 */
const WORKSPACE_SCOPE = ''

export interface UseVaultResult {
  /** The rows the table draws: set keys only, filtered by `query`, alphabetical. */
  keys: VaultKey[]
  /** Set keys before the filter, so an empty table can say which kind of empty it is. */
  total: number
  isLoading: boolean
  error: Error | null
  query: string
  setQuery: (value: string) => void
  /** Real values for the rows revealed in this page session, keyed by name. */
  revealed: Readonly<Record<string, string>>
  reveal: (name: string) => void
  hide: (name: string) => void
  /** The row a reveal is in flight for, so only that row spins. */
  revealingName?: string
  isAdding: boolean
  /** Set while the key form is open on an existing key. */
  editingName?: string
  openAdd: () => void
  openEdit: (name: string) => void
  closeForm: () => void
  save: (name: string, value: string) => void
  isSaving: boolean
  /** Set while the removal confirmation is open. */
  removalName?: string
  askToRemove: (name: string) => void
  cancelRemoval: () => void
  confirmRemoval: () => void
  isRemoving: boolean
  /** Hermes' own refusal — a denied name, a 429 on reveal — shown verbatim. */
  writeError?: string
}

/**
 * The workspace vault, and the three writes that change it.
 *
 * **Why this store is the roster-wide one, precisely.** A turn for employee X runs inside
 * `set_secret_scope(build_profile_secret_scope(<X home>/.env))`, and `get_secret` resolves
 * that scope first, then falls through to `os.environ` — which the gateway process seeded
 * from `<COMPUTER_HOME>/.env` at startup (`load_computer_dotenv`). So X's own key of the
 * same name wins, and a key only in this vault still reaches X.
 *
 * A write is reachable immediately rather than at the next restart, because `save_env_value`
 * sets `os.environ[key]` as well as rewriting the file.
 *
 * Two caveats, recorded here because neither is visible from the client:
 *
 * 1. A gateway started with `multiplex_profiles` on calls `set_multiplex_active(True)`, and a
 *    scope miss then returns nothing instead of falling through
 *    (`agent/secret_scope.py:get_secret`). Under that flag this vault is not inherited. Only
 *    `gateway/run.py` sets it — the dashboard gateway this app talks to does not — and no
 *    REST route reports it, so the page neither renders the difference nor pretends to know.
 * 2. `<COMPUTER_HOME>/.env` is also the `default` employee's own file: `get_profile_dir`
 *    maps `default` back to the install home. So on a normal install this page and that one
 *    employee's vault are two views of one file, and a key shown in both is stored once.
 *
 * **Revealed values are component state, not cache.** They are the only plaintext secrets
 * in the app; in React Query they would outlive the page and be handed to every other
 * subscriber of the key. Here they die with the view, and a re-reveal costs another
 * rate-limited, audited call.
 */
export function useVault(): UseVaultResult {
  const queryClient = useQueryClient()
  const env = useQuery({
    queryKey: GLOBAL_ENV_KEY,
    queryFn: fetchGlobalEnv,
    staleTime: 10_000,
  })

  const [query, setQuery] = useState('')
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [form, setForm] = useState<{ name?: string } | undefined>(undefined)
  const [removalName, setRemovalName] = useState<string | undefined>(undefined)

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: GLOBAL_ENV_KEY })

  const revealer = useMutation({
    mutationFn: (name: string) => revealProfileEnvVar(WORKSPACE_SCOPE, name),
    onSuccess: (value, name) => setRevealed((seen) => ({ ...seen, [name]: value })),
  })

  const writer = useMutation({
    mutationFn: ({ name, value }: { name: string; value: string }) =>
      setProfileEnvVar(WORKSPACE_SCOPE, name, value),
    onSuccess: (_result, { name }) => {
      /*
       * A rewritten key's old plaintext would otherwise still be on screen, labelled as the
       * current value. Drop it rather than showing a stale secret as a live one.
       */
      setRevealed(({ [name]: _gone, ...rest }) => rest)
      setForm(undefined)
      return invalidate()
    },
  })

  const remover = useMutation({
    mutationFn: (name: string) => deleteProfileEnvVar(WORKSPACE_SCOPE, name),
    onSuccess: (_result, name) => {
      setRevealed(({ [name]: _gone, ...rest }) => rest)
      setRemovalName(undefined)
      return invalidate()
    },
  })

  const rows = useMemo(() => toVaultKeys(env.data), [env.data])
  const needle = query.trim().toLowerCase()
  const keys = useMemo(
    () =>
      needle
        ? rows.filter(
            (row) =>
              row.name.toLowerCase().includes(needle) ||
              row.description.toLowerCase().includes(needle),
          )
        : rows,
    [rows, needle],
  )

  const failed = [revealer, writer, remover].find((mutation) => mutation.error)

  const clearWriteError = (): void => {
    revealer.reset()
    writer.reset()
    remover.reset()
  }

  return {
    keys,
    total: rows.length,
    isLoading: env.isPending,
    error: env.error,
    query,
    setQuery,
    revealed,
    reveal: (name) => revealer.mutate(name),
    hide: (name) => setRevealed(({ [name]: _gone, ...rest }) => rest),
    revealingName: revealer.isPending ? revealer.variables : undefined,
    isAdding: form !== undefined && form.name === undefined,
    editingName: form?.name,
    openAdd: () => {
      clearWriteError()
      setForm({})
    },
    openEdit: (name) => {
      clearWriteError()
      setForm({ name })
    },
    closeForm: () => setForm(undefined),
    save: (name, value) => writer.mutate({ name, value }),
    isSaving: writer.isPending,
    removalName,
    askToRemove: (name) => {
      clearWriteError()
      setRemovalName(name)
    },
    cancelRemoval: () => setRemovalName(undefined),
    confirmRemoval: () => {
      if (removalName !== undefined) remover.mutate(removalName)
    },
    isRemoving: remover.isPending,
    writeError: failed?.error?.message || undefined,
  }
}

/**
 * The keys the workspace actually holds, alphabetically.
 *
 * **The `isSet` filter is the whole point.** `GET /api/env` answers the entire catalogue —
 * 295 rows on a stock install, of which two were set — so listing the payload unfiltered
 * would claim the workspace holds hundreds of credentials it has none of. `is_set` is the
 * only field that separates a key on disk from a name Hermes merely knows.
 */
function toVaultKeys(env: ProfileEnv | undefined): VaultKey[] {
  if (!env) return []

  return Object.entries(env)
    .filter(([, key]) => key.isSet)
    .map(([name, key]) => ({
      name,
      masked: key.redactedValue ?? '••••',
      description: key.description,
      isPassword: key.isPassword,
      channelManaged: key.channelManaged,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
