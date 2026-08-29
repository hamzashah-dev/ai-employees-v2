import { useState } from 'react'
import { useProfileEnv } from '@/modules/core/hooks/use-profile-env'
import { useConnectors } from '@/modules/thread/hooks/use-connectors'
import { MODAL_PAGES } from '../../constants'
import type { GlanceTile } from '../../components/glance-tiles'
import type { EmployeeModalPage } from '../../types'
import { namesOfEnabled, summariseConnectors } from '../../utils/connector-state'
import { toVaultKeys } from '../../utils/vault-keys'
import type { WorkspaceFileRow } from '../../utils/workspace-files'
import { useWorkspaceFiles } from '../use-workspace-files'

export interface UseEmployeeCardResult {
  page: EmployeeModalPage
  setPage: (page: EmployeeModalPage) => void
  /** The rail label for the open page — also the pane's heading. */
  title: string
  counts: Partial<Record<EmployeeModalPage, number>>
  /** Info's four summary tiles. */
  tiles: GlanceTile[]
  recent: WorkspaceFileRow[]
  totalFiles?: number
  filesLoading: boolean
}

/**
 * Which page the card is on, and everything Info needs to summarise the other three.
 *
 * The counts and the tiles come from the same three queries the pages themselves use, so
 * opening the card costs three requests once and every page after that is a cache read.
 * Nothing is gated on the open page: a summary is only useful *before* you have visited the
 * page it describes.
 *
 * A page whose query has not answered is left out of `counts` rather than reported as `0` —
 * "no connectors" and "not asked yet" are different claims, and the rail draws a number only
 * for the first. The tiles say `…` for the same reason.
 */
export function useEmployeeCard(
  profile: string,
  model: string | null,
): UseEmployeeCardResult {
  const [page, setPage] = useState<EmployeeModalPage>('info')

  const files = useWorkspaceFiles(profile)
  const connectors = useConnectors(profile)
  const env = useProfileEnv(profile)

  const filesReady = !files.isLoading && !files.error
  const connReady = !connectors.isLoading && !connectors.error
  const envReady = !env.isPending && !env.isError

  const vaultKeys = envReady ? toVaultKeys(env.data) : []
  const managed = vaultKeys.filter((key) => key.channelManaged).length

  const counts: Partial<Record<EmployeeModalPage, number>> = {}
  if (filesReady) counts.files = files.files.length
  if (connReady) counts.connectors = connectors.servers.length
  if (envReady) counts.vaults = vaultKeys.length

  const newest = files.files[0]

  const tiles: GlanceTile[] = [
    {
      page: 'connectors',
      label: 'Connectors',
      value: connReady ? summariseConnectors(connectors.servers) || 'None set up' : '…',
      note: connReady ? namesOfEnabled(connectors.servers) : 'Reading servers',
    },
    {
      page: 'files',
      label: 'Workspace',
      value: filesReady ? `${files.files.length} ${plural(files.files.length, 'file')}` : '…',
      note: filesReady
        ? newest
          ? `Last written ${newest.timeLabel}`
          : 'Nothing written yet'
        : 'Reading workspace',
    },
    {
      page: 'vaults',
      label: 'Vaults',
      value: envReady ? `${vaultKeys.length} ${plural(vaultKeys.length, 'key')}` : '…',
      note: envReady
        ? managed > 0
          ? `${managed} managed by Channels`
          : 'All editable here'
        : 'Reading keys',
    },
    {
      // Stays on Info: the model's control is the picker on the state line above, so the
      // tile states the fact and sends you two inches up rather than to another page.
      page: 'info',
      label: 'Model',
      value: model ?? 'Not set',
      note: model ? 'Applies from the next message' : 'Hermes has none set for this profile',
      mono: model !== null,
    },
  ]

  return {
    page,
    setPage,
    title: MODAL_PAGES.find((entry) => entry.id === page)?.label ?? 'Info',
    counts,
    tiles,
    recent: files.files,
    totalFiles: filesReady ? files.files.length : undefined,
    filesLoading: files.isLoading,
  }
}

const plural = (count: number, word: string): string => (count === 1 ? word : `${word}s`)
