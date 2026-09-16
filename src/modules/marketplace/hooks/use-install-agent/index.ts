import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { AGENT_PACKS, type AgentPack } from 'virtual:agent-packs'
import {
  createManagedDir,
  deleteManagedFile,
  fetchSystemStatus,
  importProfile,
  uploadManagedFile,
} from '@/modules/core/services/hermes/rest'
import type { HermesProfileImportResult } from '@/modules/core/services/hermes/types'
import type { CatalogAgent } from '../../constants/catalog'

/**
 * The pack behind an agent, or `undefined` when there is none.
 *
 * Only ids with a pack are installable, which is why the shelf is derived from
 * `AGENT_PACKS` rather than from a hand-kept list — see `AVAILABLE_AGENT_IDS`.
 */
export function packFor(id: string): AgentPack | undefined {
  return AGENT_PACKS.find((pack) => pack.id === id)
}

/**
 * Where uploaded archives are staged on the Hermes machine, under its own
 * `COMPUTER_HOME`. A cache subdirectory because that is exactly what these are:
 * the profile is extracted out of the archive, and the archive is then deleted.
 */
const STAGING_SUBDIR = 'cache/employee-packs'

async function resolveComputerHome(): Promise<string> {
  const status = await fetchSystemStatus()
  const home = status.computer_home?.replace(/\/+$/, '')

  /*
   * `computer_home` is omitted on a gated (network-exposed) bind — deliberately,
   * since /api/status is public and absolute host paths would be recon. Without
   * it there is nowhere to put the archive, and no second endpoint that reports
   * a writable path. Say that, rather than guessing at `/root/.computer` and
   * failing later with a path error that explains nothing.
   */
  if (!home) {
    throw new Error(
      'This Hermes does not report its COMPUTER_HOME, so there is nowhere to upload the ' +
        'agent pack to. Installing needs a loopback or --insecure bind.',
    )
  }

  return home
}

/**
 * Install an agent onto the Hermes machine.
 *
 * Three calls, because Hermes has no endpoint that takes a pack from a browser:
 * `POST /api/profiles/import` reads a `.tar.gz` off the *backend's* filesystem
 * (`ProfileImport.archive` is a path), and the cloud VM shares no filesystem
 * with this app. So the pack — built from `<repo>/agents/<id>/` at build time —
 * is fetched out of the bundle, uploaded, and then imported by the path it
 * landed at.
 *
 * The archive is deleted afterwards whether or not the import succeeded. It is
 * a transfer artefact, and leaving it behind would have the next install
 * silently overwrite it.
 *
 * Note `POST /api/profiles/install` does not exist on Hermes 0.21 — it answers
 * 405. An earlier version of this hook called it, so hiring never worked.
 */
export async function installAgentPack(id: string): Promise<HermesProfileImportResult> {
  const pack = packFor(id)
  if (!pack) {
    throw new Error(`No installable pack for "${id}" — nothing was built from agents/${id}/.`)
  }

  const response = await fetch(pack.url)
  if (!response.ok) {
    throw new Error(`The pack for "${id}" is missing from this build (${response.status}).`)
  }
  const archive = await response.blob()

  const filename = `${pack.id}.tar.gz`
  const home = await resolveComputerHome()
  const stagingDir = `${home}/${STAGING_SUBDIR}`
  const archivePath = `${stagingDir}/${filename}`

  /*
   * Clear the delete tombstone first, if there is one.
   *
   * Deleting a profile writes `profiles/.deleted/<name>`, and every listing
   * path in `computer_cli/profiles.py` checks it — so a hidden profile stays
   * hidden no matter what is on disk. `create_profile` clears it
   * (`clear_named_profile_deleted`, profiles.py:1234); `import_profile` does
   * not. Importing over a tombstoned name therefore succeeds, returns `ok`,
   * writes the whole profile — and Hermes never lists it. Re-hiring an agent
   * you had fired looked like it worked and did nothing.
   *
   * Best effort: no tombstone is the normal case and a 404 here is not a
   * failure. This mirrors what creating a profile of the same name would do,
   * so it restores the intended behaviour rather than inventing one.
   */
  await deleteManagedFile(`${home}/profiles/.deleted/${pack.id}`).catch(() => {})

  await createManagedDir(stagingDir)
  await uploadManagedFile(archivePath, archive, filename)

  try {
    // `name` is passed rather than inferred so the profile is named for the
    // catalog id even if the archive's root directory ever diverges from it.
    return await importProfile({ archive: archivePath, name: pack.id })
  } finally {
    await deleteManagedFile(archivePath).catch(() => {
      // Best effort. A stranded archive in a cache directory is untidy, not
      // broken, and reporting it would bury the import's own error.
    })
  }
}

/**
 * Hire an agent by installing its pack.
 *
 * Importing over an existing profile is a 400 whose `detail` names the
 * collision, and the card prints it — hiring twice reports rather than
 * overwrites a profile in use.
 */
export function useInstallAgent(
  agent: CatalogAgent,
): UseMutationResult<HermesProfileImportResult, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['install-agent', agent.id],
    mutationFn: () => installAgentPack(agent.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  })
}
