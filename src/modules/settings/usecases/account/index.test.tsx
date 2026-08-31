import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Providers } from '@/app/providers'
import type { HermesProfile, HermesStatus, MemoryFile } from '@/modules/core/services/hermes/types'
import { AccountView } from '.'
import {
  MEMORY_ENTRY_DELIMITER,
  parseMemoryEntries,
  serializeMemoryEntries,
} from './hooks/use-account-settings'

const fetchMemoryFile = vi.fn()
const saveMemoryFile = vi.fn()
const fetchSystemStatus = vi.fn()
const fetchConfig = vi.fn(
  async () => ({ auxiliary: { background_review: { enabled: true } } }),
)
const updateConfig = vi.fn(async (_config: unknown) => ({ ok: true }))
const fetchProfiles = vi.fn()

vi.mock('@/modules/core/services/hermes/rest', () => ({
  fetchMemoryFile: () => fetchMemoryFile(),
  saveMemoryFile: (content: string) => saveMemoryFile(content),
  fetchSystemStatus: () => fetchSystemStatus(),
  fetchProfiles: () => fetchProfiles(),
  fetchConfig: () => fetchConfig(),
  updateConfig: (config: unknown) => updateConfig(config),
}))

/** Two memories in the store's own format — `ENTRY_DELIMITER` is `"\n§\n"`, not a bullet. */
const ENTRIES = [
  'Ships on Thursdays. Never schedule a launch for a Friday.',
  'Writes in British English. No em dashes in product copy.',
]

const memoryFile = (entries: readonly string[] = ENTRIES): MemoryFile => ({
  content: entries.join(MEMORY_ENTRY_DELIMITER),
  path: '/home/u/.computer/memories/MEMORY.md',
  exists: entries.length > 0,
})

const STATUS: HermesStatus = {
  version: '0.14.0',
  gateway_running: true,
  overall: 'ok',
  computer_home: '/home/u/.computer',
  disk: { total_mb: 471_859, free_mb: 43_110, used_percent: 90.9, pressure: 'ok' },
}

const profile = (name: string): HermesProfile => ({
  name,
  path: `/home/u/.computer/profiles/${name}`,
  is_default: name === 'default',
  model: null,
  provider: null,
  has_env: false,
  skill_count: 0,
  gateway_running: true,
  description: '',
})

const renderView = (): ReturnType<typeof userEvent.setup> => {
  render(
    <Providers>
      <AccountView />
    </Providers>,
  )
  return userEvent.setup()
}

beforeEach(() => {
  fetchMemoryFile.mockReset().mockResolvedValue(memoryFile())
  saveMemoryFile.mockReset().mockResolvedValue({ ok: true })
  fetchSystemStatus.mockReset().mockResolvedValue(STATUS)
  fetchProfiles
    .mockReset()
    .mockResolvedValue([profile('chief-of-staff'), profile('design'), profile('default')])
})

/**
 * The file format, checked against `tools/memory_tool.py` rather than against the design.
 *
 * These two are the load-bearing pair: `MemoryStore._detect_external_drift` snapshots the
 * file and then refuses the agent's next memory write if what we save does not re-parse to
 * what we read, so a round trip that is not byte-exact is data loss with a delay on it.
 */
describe('the MEMORY.md entry format', () => {
  it('round-trips a file byte for byte', () => {
    const raw = memoryFile().content
    expect(serializeMemoryEntries(parseMemoryEntries(raw))).toBe(raw)
  })

  it('reads a file the agent has never written as no memories', () => {
    expect(parseMemoryEntries('')).toEqual([])
    expect(parseMemoryEntries('\n\n')).toEqual([])
  })

  it('keeps a bulleted entry whole instead of splitting it into lines', () => {
    // Splitting on newlines or bullets is the tempting reading of "MEMORY.md is markdown",
    // and it is wrong: the store's delimiter is the only entry boundary there is.
    const raw = '- one\n- two'
    expect(parseMemoryEntries(raw)).toEqual(['- one\n- two'])
  })

  it('joins with no trailing newline, as MemoryStore._write_file does', () => {
    expect(serializeMemoryEntries(['a', 'b'])).toBe('a\n§\nb')
  })
})

describe('Settings › Account · identity', () => {
  it('renders the code-set name and plan with the reason it cannot be edited', async () => {
    renderView()

    expect(await screen.findByText('Imagine User')).toBeInTheDocument()
    expect(
      screen.getByText(/Pro Plan · this Hermes install has no sign-in/),
    ).toBeInTheDocument()
  })

  it('offers no way to edit the name', async () => {
    renderView()
    await screen.findByText('Imagine User')

    // Nothing that could write to a constant: no edit control, and no text field.
    expect(screen.queryByRole('button', { name: /edit (name|profile|account)/i })).toBeNull()
    expect(screen.queryByRole('textbox', { name: /name/i })).toBeNull()
  })
})

describe('Settings › Account · memory', () => {
  it('lists the entries from the file, counted, and with no invented byline', async () => {
    renderView()

    expect(await screen.findByText(ENTRIES[0]!)).toBeInTheDocument()
    expect(screen.getByText(ENTRIES[1]!)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Memory · what every employee knows about you · 2/ }),
    ).toBeInTheDocument()

    // The canvas' attribution line is stored nowhere, so it is drawn nowhere.
    expect(screen.queryByText(/Written by/i)).toBeNull()
    expect(screen.queryByText(/You added this/i)).toBeNull()
  })

  it('writes an edited entry back as the whole joined document', async () => {
    const user = renderView()
    await screen.findByText(ENTRIES[0]!)

    await user.click(screen.getByRole('button', { name: 'Manage memory 1' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    const field = screen.getByRole('textbox', { name: 'Edit memory 1' })
    await user.clear(field)
    await user.type(field, 'Ships on Tuesdays now.')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(saveMemoryFile).toHaveBeenCalledWith(
        `Ships on Tuesdays now.${MEMORY_ENTRY_DELIMITER}${ENTRIES[1]}`,
      )
    })
  })

  it('appends a new entry without disturbing the others', async () => {
    const user = renderView()
    await screen.findByText(ENTRIES[0]!)

    await user.click(screen.getByRole('button', { name: 'Add memory' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Add a memory' }),
      'Prefers metric units.',
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(saveMemoryFile).toHaveBeenCalledWith(
        [...ENTRIES, 'Prefers metric units.'].join(MEMORY_ENTRY_DELIMITER),
      )
    })
  })

  it('removes an entry by saving the document without it', async () => {
    const user = renderView()
    await screen.findByText(ENTRIES[0]!)

    await user.click(screen.getByRole('button', { name: 'Manage memory 2' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Remove' }))

    await waitFor(() => expect(saveMemoryFile).toHaveBeenCalledWith(ENTRIES[0]))
  })

  it('keeps the editor and the typed text when Hermes refuses the save', async () => {
    saveMemoryFile.mockRejectedValue(
      new Error('Could not write MEMORY.md: [Errno 13] Permission denied'),
    )
    const user = renderView()
    await screen.findByText(ENTRIES[0]!)

    await user.click(screen.getByRole('button', { name: 'Manage memory 1' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    const field = screen.getByRole('textbox', { name: 'Edit memory 1' })
    await user.clear(field)
    await user.type(field, 'Ships on Tuesdays now.')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    // The whole-document PUT changed nothing, so the only copy of this sentence is the one
    // on screen. Closing the form on submit would have thrown it away.
    expect(await screen.findByRole('alert')).toHaveTextContent(/Permission denied/)
    expect(screen.getByRole('textbox', { name: 'Edit memory 1' })).toHaveValue(
      'Ships on Tuesdays now.',
    )
  })

  it('says so plainly when the agent has never written a memory', async () => {
    fetchMemoryFile.mockResolvedValue({
      content: '',
      path: '/home/u/.computer/memories/MEMORY.md',
      exists: false,
    })
    renderView()

    expect(await screen.findByText(/No memories yet/)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /what every employee knows about you · 0/ }),
    ).toBeInTheDocument()
  })

  it('reads the write-memories switch from the config', async () => {
    renderView()

    // The switch renders immediately but disabled and stateless while the config
    // read is pending, so wait for the readout rather than for the element.
    const control = await screen.findByRole('switch', {
      name: 'Let employees write memories',
    })
    await waitFor(() => expect(control).toHaveAttribute('aria-checked', 'true'))
    expect(control).toBeEnabled()
  })

  it('sends only the one config leaf when the switch is turned off', async () => {
    renderView()

    const control = await screen.findByRole('switch', {
      name: 'Let employees write memories',
    })
    await waitFor(() => expect(control).toBeEnabled())
    await userEvent.click(control)

    // PUT /api/config deep-merges, so a one-leaf patch cannot drop the root keys
    // this surface never renders.
    expect(updateConfig).toHaveBeenCalledWith({
      auxiliary: { background_review: { enabled: false } },
    })
  })

  it('draws no state while the config is still being read', async () => {
    type ConfigDoc = { auxiliary: { background_review: { enabled: boolean } } }
    let release: (value: ConfigDoc) => void = () => {}
    fetchConfig.mockImplementationOnce(
      () => new Promise<ConfigDoc>((resolve) => { release = resolve }),
    )
    renderView()

    const control = await screen.findByRole('switch', {
      name: 'Let employees write memories',
    })
    // Pending is not "off" — a guessed position would understate the install.
    expect(control).not.toHaveAttribute('aria-checked')
    expect(control).toBeDisabled()
    release({ auxiliary: { background_review: { enabled: true } } })
  })
})

describe('Settings › Account · system', () => {
  it('shows the version, the gateway, the roster size, the disk and COMPUTER_HOME', async () => {
    renderView()

    expect(await screen.findByText('0.14.0')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
    expect(screen.getByText('3 employees')).toBeInTheDocument()
    // 43_110 MB / 1024 and 471_859 MB / 1024 — formatted from the coarse MB the endpoint
    // reports, never inflated back into a byte count.
    expect(screen.getByText('42.1 GB free of 460.8 GB')).toBeInTheDocument()
    expect(screen.getByText(/COMPUTER_HOME · \/home\/u\/\.computer/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Open Hermes dashboard/ }),
    ).toBeInTheDocument()
  })

  it('draws no host or operating-system row, which /api/status cannot answer', async () => {
    renderView()
    await screen.findByText('0.14.0')

    expect(screen.queryByText(/^Host$/)).toBeNull()
    expect(screen.queryByText(/macOS|arm64|Linux|Windows/)).toBeNull()
    // And no group count either — Settings cannot see the groups store.
    expect(screen.queryByText(/group/i)).toBeNull()
  })

  it('reports a field the endpoint omitted rather than rendering it as zero', async () => {
    fetchSystemStatus.mockResolvedValue({
      version: '0.14.0',
      gateway_running: false,
      // The status route's own `except` path answers `{pressure: 'unknown'}` with no numbers.
      disk: { pressure: 'unknown' },
    })
    renderView()

    expect(await screen.findByText('Not running')).toBeInTheDocument()
    expect(screen.queryByText(/0\.0 GB/)).toBeNull()
    expect(screen.getAllByText('Not reported').length).toBeGreaterThan(0)
  })
})
