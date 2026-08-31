import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FC } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SidebarCollapsedProvider } from '@/modules/roster/contexts/sidebar-collapsed'
import { SidebarFooter } from '@/modules/roster/components/sidebar-footer'
import { ROUTES } from '@/modules/roster/constants'
import { SettingsView } from '.'

/**
 * The Settings shell, and the button that opens it.
 *
 * The three sections have their own tests; what only a mount catches is this
 * file's class of bug — a tab whose value no panel owns, a lazy import naming an
 * export that does not exist, a footer button that looks like a link and goes
 * nowhere. So the sections are stubbed here and the routing is real.
 */
vi.mock('./usecases/account', () => ({ AccountView: () => <p>Account panel</p> }))
vi.mock('./usecases/vault', () => ({ VaultView: () => <p>Vault panel</p> }))
vi.mock('./usecases/connectors', () => ({ ConnectorsView: () => <p>Connectors panel</p> }))

/** The active URL, as readable text — a tab is only linkable if it is in there. */
const PathProbe: FC = () => <p>{`at ${useLocation().pathname}`}</p>

/**
 * The two mounts `src/app` gives this surface, plus a stand-in for everywhere else
 * so the footer can be clicked *from* somewhere rather than from an unmatched route.
 */
const settingsRoutes = (
  <Routes>
    <Route path={ROUTES.SETTINGS} element={<SettingsView />} />
    <Route path={`${ROUTES.SETTINGS}/:tab`} element={<SettingsView />} />
    <Route path="*" element={<p>Somewhere else</p>} />
  </Routes>
)

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      {settingsRoutes}
      <PathProbe />
    </MemoryRouter>,
  )

describe('settings shell', () => {
  it('draws the three sections as tabs, in the design’s order', async () => {
    renderAt(ROUTES.SETTINGS)

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Account', 'Vault', 'Connectors'])
    expect(await screen.findByText('Account panel')).toBeInTheDocument()
  })

  it('switches section and puts the tab in the URL', async () => {
    renderAt(ROUTES.SETTINGS)
    await screen.findByText('Account panel')

    await userEvent.click(screen.getByRole('tab', { name: 'Vault' }))

    expect(await screen.findByText('Vault panel')).toBeInTheDocument()
    expect(screen.queryByText('Account panel')).not.toBeInTheDocument()
    expect(screen.getByText('at /settings/vault')).toBeInTheDocument()
  })

  it('opens on the tab the URL names, so a tab can be linked', async () => {
    renderAt('/settings/connectors')

    expect(await screen.findByText('Connectors panel')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Connectors' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('sends an unknown tab segment back to Account rather than drawing nothing', async () => {
    renderAt('/settings/billing')

    expect(await screen.findByText('Account panel')).toBeInTheDocument()
    expect(screen.getByText('at /settings/account')).toBeInTheDocument()
  })
})

describe('the sidebar’s Settings button', () => {
  it('is a real link that opens the Settings surface', async () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.NEW_CHAT]}>
        <SidebarFooter />
        {settingsRoutes}
      </MemoryRouter>,
    )

    expect(screen.getByText('Somewhere else')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Settings' })
    expect(link).toHaveAttribute('href', ROUTES.SETTINGS)

    await userEvent.click(link)

    expect(await screen.findByText('Account panel')).toBeInTheDocument()
  })

  it('is not drawn on the collapsed icon rail', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.NEW_CHAT]}>
        <SidebarCollapsedProvider isCollapsed>
          <SidebarFooter />
        </SidebarCollapsedProvider>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })
})
