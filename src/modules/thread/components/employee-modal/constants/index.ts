import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { FolderClosedIcon } from '@repo/icons/folder-closed-icon'
import { InfoIcon } from '@repo/icons/info'
import { LockIcon } from '@repo/icons/lock-icon'
import type { ModalPageDef } from '../types'

/**
 * The employee's scratch directory, relative to `HermesProfile.path`.
 *
 * `_PROFILE_DIRS` in `computer_cli/profiles.py` bootstraps `workspace/` into every profile
 * it creates, alongside `memories`, `sessions`, `skills` and `logs`. It is the only
 * per-employee directory that is *for* the employee's output rather than for Hermes' own
 * machinery, which is why the modal lists it rather than the profile root — the root is
 * `config.yaml`, `state.db`, `SOUL.md` and a dozen caches, none of which are "files".
 *
 * The `default` profile predates the bootstrap and has no `workspace/` at all, so a 404 is
 * an expected answer here, not an error. See `use-workspace-files`.
 */
export const WORKSPACE_DIR = 'workspace'

/** How many file rows show before "See all". Enough to fill the section without scrolling it. */
export const VISIBLE_FILES = 5

/**
 * The rail's pages, in order.
 *
 * A nav rather than a tablist, and deliberately: WhatsApp's group card — the reference for
 * this layout — is a list of destinations, not a tab strip, and `aria-current` describes
 * that honestly. A `role="tablist"` would promise roving arrow-key focus that four plain
 * buttons do not implement.
 */
export const MODAL_PAGES: ModalPageDef[] = [
  { id: 'info', label: 'Info', icon: InfoIcon },
  { id: 'files', label: 'Files', icon: FolderClosedIcon },
  { id: 'connectors', label: 'Connectors', icon: ConnectorsIcon },
  { id: 'vaults', label: 'Vaults', icon: LockIcon },
]

/**
 * The rail row box. A local copy of the roster sidebar's `SIDEBAR_ROW_CLASSES` rather than
 * an import: a feature module may not reach into another's constants, and the two are the
 * same shape by design intent, not by shared implementation.
 */
export const RAIL_ROW_CLASSES =
  'flex h-9 w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-2.5 text-left transition-all duration-200 ease-linear hover:bg-fill-variant-hover'

/** How many workspace rows the Info page previews before it hands off to the Files page. */
export const GLANCE_FILES = 3

/**
 * The largest file this app will pull into memory to preview, in bytes.
 *
 * Below the backend's own 100MB `_MANAGED_FILE_MAX_BYTES` on purpose. Two kinds have to be
 * fetched whole before anything can be shown — a PDF needs a blob URL, text needs its
 * characters — and a blob is a full copy in the tab's memory that lives until the object
 * URL is revoked. 25MB matches `_MEDIA_MAX_BYTES`, the ceiling Hermes already applies to
 * its own in-memory media reads, so the two limits agree rather than each inventing one.
 *
 * Images, video and audio are exempt: they stream off `/api/files/download` by URL, and
 * `FileResponse` answers `Range` with a 206, so a large video seeks without being buffered.
 */
export const PREVIEW_MAX_BYTES = 25 * 1_024 * 1_024

/**
 * The ceiling on a *text* preview, well under `PREVIEW_MAX_BYTES`.
 *
 * A megabyte of characters in one `<pre>` is a frozen tab, not a preview. This is a
 * rendering limit rather than a transfer one, which is why it is separate.
 */
export const TEXT_PREVIEW_MAX_BYTES = 2 * 1_024 * 1_024

/**
 * Hermes' own hard cap, from `_MANAGED_FILE_MAX_BYTES` (`computer_cli/web_server.py:1712`).
 *
 * Above it `/api/files/download` answers 413, so a file this large cannot be previewed
 * *or* downloaded — the viewer has to say so rather than offering a link that 413s.
 */
export const MANAGED_FILE_MAX_BYTES = 100 * 1_024 * 1_024
