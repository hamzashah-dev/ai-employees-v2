import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import type { FC, ReactNode } from 'react'
import type { ProfileEnv, ProfileEnvKey } from '@/modules/core/services/hermes/rest'
import { VaultView } from '.'

const fetchGlobalEnv = vi.fn()
const setProfileEnvVar = vi.fn()
const deleteProfileEnvVar = vi.fn()
const revealProfileEnvVar = vi.fn()

vi.mock('@/modules/core/services/hermes/rest', () => ({
  fetchGlobalEnv: () => fetchGlobalEnv(),
  setProfileEnvVar: (...args: unknown[]) => setProfileEnvVar(...args),
  deleteProfileEnvVar: (...args: unknown[]) => deleteProfileEnvVar(...args),
  revealProfileEnvVar: (...args: unknown[]) => revealProfileEnvVar(...args),
}))

/** A `/api/env` row, defaulted to the common case: a set, secret, catalogued key. */
const key = (over: Partial<ProfileEnvKey> = {}): ProfileEnvKey => ({
  isSet: true,
  isPassword: true,
  redactedValue: '••••',
  description: '',
  category: 'provider',
  providerLabel: '',
  tools: [],
  channelManaged: false,
  custom: false,
  ...over,
})

/**
 * The shape the endpoint really answers: mostly rows it merely knows the name of.
 * `OPENAI_API_KEY` is here unset on purpose — 295 of these arrive on a stock install, and
 * the page listing one of them would be claiming a key the workspace does not hold.
 */
const ENV: ProfileEnv = {
  FAL_KEY: key({ redactedValue: 'fal-...8c4d', description: 'Fal AI image and video models' }),
  ANTHROPIC_API_KEY: key({ redactedValue: 'sk-a...4b7e' }),
  TELEGRAM_BOT_TOKEN: key({ redactedValue: '7261...9f31', channelManaged: true }),
  OPENAI_API_KEY: key({ isSet: false, redactedValue: null }),
}

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
    }
  >
    <TooltipProvider>{children}</TooltipProvider>
  </QueryClientProvider>
)

const renderVault = () => render(<VaultView />, { wrapper: Wrapper })

/** Radix marks the page behind an open dialog `pointer-events: none`, which jsdom cannot
 *  resolve per-element; the check would fail on every control inside a portal. */
const user = () => userEvent.setup({ pointerEventsCheck: 0 })

describe('VaultView', () => {
  beforeEach(() => {
    fetchGlobalEnv.mockReset().mockResolvedValue(ENV)
    setProfileEnvVar.mockReset().mockResolvedValue({ success: true })
    deleteProfileEnvVar.mockReset().mockResolvedValue({ found: true })
    revealProfileEnvVar.mockReset().mockResolvedValue('fal-live-9d21e8c4d')
  })

  it('lists the keys the workspace holds, and only those', async () => {
    renderVault()

    expect(await screen.findByText('FAL_KEY')).toBeInTheDocument()
    expect(screen.getByText('ANTHROPIC_API_KEY')).toBeInTheDocument()
    expect(screen.getByText('TELEGRAM_BOT_TOKEN')).toBeInTheDocument()
    expect(screen.queryByText('OPENAI_API_KEY')).not.toBeInTheDocument()

    // Hermes' own mask, not a last-4 computed here.
    expect(screen.getByText('fal-...8c4d')).toBeInTheDocument()
  })

  it('has a Key and a Value column and nothing the backend cannot fill', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    expect(screen.getByRole('columnheader', { name: 'Key' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Value' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Used by' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Last used' })).not.toBeInTheDocument()
  })

  it('says up front that a reveal is logged', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    expect(
      screen.getByText(/Revealing a value is rate-limited and recorded/),
    ).toBeInTheDocument()
  })

  it('filters the table as you search, and says so when nothing matches', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    const search = screen.getByRole('textbox', { name: 'Search keys' })

    await user().type(search, 'anthropic')
    expect(screen.getByText('ANTHROPIC_API_KEY')).toBeInTheDocument()
    expect(screen.queryByText('FAL_KEY')).not.toBeInTheDocument()

    await user().clear(search)
    await user().type(search, 'stripe')
    expect(screen.getByText('No key matches “stripe”.')).toBeInTheDocument()
  })

  it('leaves a channel-managed key to the dashboard that owns it', async () => {
    renderVault()
    await screen.findByText('TELEGRAM_BOT_TOKEN')

    expect(screen.getByText('Configured on the Hermes dashboard')).toBeInTheDocument()
    expect(screen.getByText('Channels')).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Replace TELEGRAM_BOT_TOKEN' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Remove TELEGRAM_BOT_TOKEN' }),
    ).not.toBeInTheDocument()

    // Reveal is a read and works on any key in the file, so it is not withheld.
    expect(
      screen.getByRole('button', { name: 'Reveal TELEGRAM_BOT_TOKEN' }),
    ).toBeEnabled()
  })

  it('reveals a value through the audited endpoint', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    await user().click(screen.getByRole('button', { name: 'Reveal FAL_KEY' }))

    expect(revealProfileEnvVar).toHaveBeenCalledWith('', 'FAL_KEY')
    expect(await screen.findByText('fal-live-9d21e8c4d')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide FAL_KEY' })).toBeInTheDocument()
  })

  it('refuses a malformed key name before the round trip', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    await user().click(screen.getByRole('button', { name: 'Add key' }))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled()

    await user().type(within(dialog).getByLabelText('Key name'), '2 bad name')
    await user().type(within(dialog).getByLabelText('Value'), 'sk-live-abc')

    expect(within(dialog).getByText(/must start with a letter or underscore/)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(setProfileEnvVar).not.toHaveBeenCalled()
  })

  it('writes a valid key to the workspace scope', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    await user().click(screen.getByRole('button', { name: 'Add key' }))
    const dialog = screen.getByRole('dialog')

    await user().type(within(dialog).getByLabelText('Key name'), 'stripe_secret_key')
    await user().type(within(dialog).getByLabelText('Value'), 'sk-live-abc')
    await user().click(within(dialog).getByRole('button', { name: 'Save' }))

    // The empty profile is the workspace store — `_profile_scope("")` is the install's home.
    expect(setProfileEnvVar).toHaveBeenCalledWith('', 'STRIPE_SECRET_KEY', 'sk-live-abc')
  })

  it('asks before destroying a key the whole roster reads', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    await user().click(screen.getByRole('button', { name: 'Remove FAL_KEY' }))

    expect(deleteProfileEnvVar).not.toHaveBeenCalled()

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Remove FAL_KEY?')).toBeInTheDocument()
    expect(within(dialog).getByText(/every employee that was relying on it/)).toBeInTheDocument()

    await user().click(within(dialog).getByRole('button', { name: 'Remove' }))
    expect(deleteProfileEnvVar).toHaveBeenCalledWith('', 'FAL_KEY')
  })

  it('abandons a removal the user backs out of', async () => {
    renderVault()
    await screen.findByText('FAL_KEY')

    await user().click(screen.getByRole('button', { name: 'Remove FAL_KEY' }))
    await user().click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }),
    )

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(deleteProfileEnvVar).not.toHaveBeenCalled()
  })

  it('shows a skeleton rather than an empty table while the listing is in flight', () => {
    fetchGlobalEnv.mockReturnValue(new Promise(() => {}))
    renderVault()

    expect(screen.getByRole('status', { name: 'Loading the vault' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('prints Hermes’ own words when the listing fails', async () => {
    fetchGlobalEnv.mockRejectedValue(new Error('Not authorised. Reload the page.'))
    renderVault()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Not authorised. Reload the page.',
    )
  })

  it('says the vault is empty rather than drawing an empty table', async () => {
    fetchGlobalEnv.mockResolvedValue({ OPENAI_API_KEY: key({ isSet: false }) })
    renderVault()

    expect(await screen.findByText(/The workspace vault is empty/)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
