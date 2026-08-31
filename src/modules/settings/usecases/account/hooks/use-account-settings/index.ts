import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchConfig,
  updateConfig,
  fetchMemoryFile,
  fetchProfiles,
  fetchSystemStatus,
  saveMemoryFile,
} from '@/modules/core/services/hermes/rest'
import type { HermesDisk } from '@/modules/core/services/hermes/types'

/**
 * How MEMORY.md separates one memory from the next.
 *
 * Not a markdown convention and not a guess: `tools/memory_tool.py:78` defines
 * `ENTRY_DELIMITER = "\n§\n"`, and `MemoryStore._parse_entries` splits on exactly that
 * string before stripping and dropping empties — which is what {@link parseMemoryEntries}
 * mirrors. `MemoryStore._write_file` joins with it and adds no trailing newline, which is
 * what {@link serializeMemoryEntries} mirrors.
 *
 * Splitting on bullets or blank lines instead would look right on screen and then break the
 * store on save. `MemoryStore._detect_external_drift` treats a file that does not round-trip
 * through this delimiter as an outside edit: it snapshots the file to `MEMORY.md.bak.<ts>`
 * and then *refuses the agent's next memory mutation* until a human resolves the drift
 * (issue #26045). So the editor reads and writes the store's own format, not a prettier one.
 */
export const MEMORY_ENTRY_DELIMITER = '\n§\n'

/** `GET /api/memory/file` — one entry for the whole install; the file is not profile-scoped. */
export const memoryFileKey = ['memory-file'] as const

/** `GET /api/status`. Distinct from `['profiles']`, which the sidebar roster already fills. */
export const systemStatusKey = ['system-status'] as const

/** Split a raw MEMORY.md into entries, exactly as `MemoryStore._parse_entries` does. */
export const parseMemoryEntries = (raw: string): string[] =>
  raw.trim().length === 0
    ? []
    : raw
        .split(MEMORY_ENTRY_DELIMITER)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)

/** Join entries back into a whole MEMORY.md, exactly as `MemoryStore._write_file` does. */
export const serializeMemoryEntries = (entries: readonly string[]): string =>
  entries
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .join(MEMORY_ENTRY_DELIMITER)

/** `['config']` — the install-wide config document. */
export const configKey = ['config'] as const

/**
 * "Let employees write memories" — now a real control.
 *
 * Bound to `auxiliary.background_review.enabled`
 * (`computer_cli/config_defaults.py:1327`), the "Master switch for automatic post-turn
 * memory/skill review forks" — i.e. exactly whether an employee may write a memory
 * without being asked.
 *
 * The write sends only that leaf. `PUT /api/config` deep-merges, so a one-leaf patch
 * cannot drop the root keys this surface never renders, and it avoids rewriting a whole
 * branch of defaults as explicit on-disk values.
 *
 * `GET /api/config` answers the DEFAULTED record, so `enabled` is present even when the
 * YAML is sparse. It is still read with `?? true` rather than `?? false`: `true` is the
 * documented default, and guessing "off" would understate what the install actually does.
 */
export const MEMORY_WRITES_CONFIG_KEY = 'auxiliary.background_review.enabled' as const

export interface AccountMemory {
  /** The file's entries, in file order. */
  entries: string[]
  isLoading: boolean
  /** Set only when MEMORY.md itself could not be read. */
  errorMessage?: string
  /** Hermes' own refusal on a save, shown verbatim. */
  writeError?: string
  isSaving: boolean
  /**
   * Each resolves `true` once MEMORY.md holds the change and `false` when Hermes refused it,
   * so a caller can keep an editor open over the text a failed save did not persist. They
   * never reject: the refusal is reported through {@link AccountMemory.writeError}, and an
   * unhandled rejection out of a click handler would be a blank console error instead.
   */
  add: (content: string) => Promise<boolean>
  update: (index: number, content: string) => Promise<boolean>
  remove: (index: number) => Promise<boolean>
  clearWriteError: () => void
}

export interface AccountSystem {
  isLoading: boolean
  /** Set only when `/api/status` itself failed. */
  errorMessage?: string
  version?: string
  /**
   * The live PID/health probe, not `gateway_state`. Absent when the field is missing, which
   * is not the same as `false` — an older backend simply does not report it.
   */
  gatewayRunning?: boolean
  /** `ok`, or `degraded` when any component in the rollup is. */
  overall?: string
  computerHome?: string
  /**
   * How many employees the roster holds, from `/api/profiles` — the same call and the same
   * `['profiles']` cache entry the sidebar fills, so the two can never disagree.
   * `/api/status` also carries a `profiles` array, but it answers `[]` both for a host with
   * no profiles and for a host whose enumeration failed, so it cannot be counted honestly.
   */
  employeeCount?: number
  /**
   * Whole MB against the filesystem COMPUTER_HOME sits on. Present only when both numbers
   * came back as numbers: `HermesDisk` is nullable field by field *and* may arrive with no
   * number keys at all, and `pressure: 'unknown'` means "could not read", never "healthy".
   */
  disk?: { totalMb: number; freeMb: number }
}

export interface MemoryWritesSwitch {
  /** `true` when employees may write memories unasked. */
  isEnabled: boolean
  /** The config document has not been read yet, so no state may be drawn. */
  isLoading: boolean
  isSaving: boolean
  error: string | null
  toggle: () => void
}

export interface UseAccountSettingsResult {
  memory: AccountMemory
  system: AccountSystem
  memoryWrites: MemoryWritesSwitch
}

/**
 * Screen 2a's data: the shared memory file, and the install it belongs to.
 *
 * Every memory mutation is a **whole-document PUT** of the joined file, because that is the
 * only write the backend offers — there is no per-entry route. Two consequences worth
 * knowing before changing this:
 *
 * 1. The list the user edits is derived from the last successful read, so a save races an
 *    agent's own memory write last-write-wins (`PUT /api/memory/file` deliberately does not
 *    take `MEMORY.md.lock`). The write itself is atomic, so a race costs a lost edit, never
 *    a torn file. Invalidating on success is what makes the next read authoritative.
 *    A refused save is reported and nothing local is changed — the editor stays open over
 *    the text, because the alternative is losing what the user typed to a 500.
 * 2. `entries` is recomputed from the query on every render rather than mirrored into state.
 *    A local copy would have to be reconciled with the refetch, and the failure mode there
 *    is a deleted memory reappearing — or worse, a stale copy being PUT back over a newer
 *    file.
 */
export function useAccountSettings(): UseAccountSettingsResult {
  const queryClient = useQueryClient()

  const memoryFile = useQuery({ queryKey: memoryFileKey, queryFn: fetchMemoryFile })
  const status = useQuery({ queryKey: systemStatusKey, queryFn: fetchSystemStatus })
  const profiles = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const config = useQuery({ queryKey: configKey, queryFn: fetchConfig })

  const entries = parseMemoryEntries(memoryFile.data?.content ?? '')

  const writer = useMutation({
    mutationFn: (next: readonly string[]) => saveMemoryFile(serializeMemoryEntries(next)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memoryFileKey }),
  })

  // `GET /api/config` answers the defaulted record, so the leaf is present even
  // when the YAML is sparse; `?? true` covers only a failed/pending read, and
  // `true` is the documented default.
  const memoryWritesEnabled = config.data?.auxiliary?.background_review?.enabled ?? true

  const configWriter = useMutation({
    mutationFn: (enabled: boolean) =>
      updateConfig({ auxiliary: { background_review: { enabled } } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: configKey }),
  })

  const write = async (next: readonly string[]): Promise<boolean> => {
    try {
      await writer.mutateAsync(next)
      return true
    } catch {
      // Already on `writer.error`, which is what the section prints.
      return false
    }
  }

  return {
    memory: {
      entries,
      isLoading: memoryFile.isPending,
      errorMessage: memoryFile.error?.message,
      writeError: writer.error?.message || undefined,
      isSaving: writer.isPending,
      add: (content) => write([...entries, content]),
      update: (index, content) =>
        write(entries.map((entry, position) => (position === index ? content : entry))),
      remove: (index) => write(entries.filter((_entry, position) => position !== index)),
      clearWriteError: () => writer.reset(),
    },
    system: {
      isLoading: status.isPending,
      errorMessage: status.error?.message,
      version: status.data?.version,
      gatewayRunning: status.data?.gateway_running,
      overall: status.data?.overall,
      computerHome: status.data?.computer_home,
      employeeCount: profiles.data?.length,
      disk: toDiskSample(status.data?.disk),
    },
    memoryWrites: {
      isEnabled: memoryWritesEnabled,
      isLoading: config.isPending,
      isSaving: configWriter.isPending,
      error: config.error?.message ?? configWriter.error?.message ?? null,
      // Fire-and-report: a rejected write leaves the switch where it was,
      // because the query is the only source of truth for its position.
      toggle: () => {
        configWriter.mutate(!memoryWritesEnabled)
      },
    },
  }
}

/** Both numbers or neither — half a disk sample cannot be rendered as a ratio. */
function toDiskSample(disk?: HermesDisk): { totalMb: number; freeMb: number } | undefined {
  const totalMb = disk?.total_mb
  const freeMb = disk?.free_mb
  if (typeof totalMb !== 'number' || typeof freeMb !== 'number') return undefined
  if (totalMb <= 0) return undefined
  return { totalMb, freeMb }
}
