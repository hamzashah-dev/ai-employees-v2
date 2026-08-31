import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fetchMcpServers,
  setMcpServerEnabled,
} from '@/modules/core/services/hermes/rest'
import type * as HermesRest from '@/modules/core/services/hermes/rest'
import type { HermesMcpServer } from '@/modules/core/services/hermes/types'
import { ConnectorsView } from '.'

/**
 * Screen 2b, against a stubbed `/api/mcp/servers`.
 *
 * The two rest functions are the only seam cut, so the query key, the account-level
 * profile argument and the toggle's write all stay real up to the last function
 * before the wire.
 */
vi.mock('@/modules/core/services/hermes/rest', async (importOriginal) => ({
  ...(await importOriginal<typeof HermesRest>()),
  fetchMcpServers: vi.fn(),
  setMcpServerEnabled: vi.fn(),
}))

const fetchMcpServersMock = vi.mocked(fetchMcpServers)
const setMcpServerEnabledMock = vi.mocked(setMcpServerEnabled)

function server(over: Partial<HermesMcpServer> & { name: string }): HermesMcpServer {
  return { transport: 'stdio', enabled: false, ...over }
}

const NOTION = server({
  name: 'notion',
  transport: 'http',
  url: 'https://mcp.notion.com/mcp',
  enabled: true,
  tools: ['search', 'fetch'],
})

const LINEAR = server({ name: 'linear', command: 'npx', args: ['-y', 'linear-mcp'] })

/** Retry off, so a rejected query settles on the first pass. */
const wrap = (children: ReactNode) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {children}
    </QueryClientProvider>,
  )

describe('account connectors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMcpServersMock.mockResolvedValue([NOTION, LINEAR])
    setMcpServerEnabledMock.mockResolvedValue({})
  })

  it('lists the install’s servers with what the payload actually says about them', async () => {
    wrap(<ConnectorsView />)

    expect(await screen.findByText('notion')).toBeInTheDocument()
    expect(screen.getByText('HTTP · mcp.notion.com · 2 tools')).toBeInTheDocument()
    expect(screen.getByText('linear')).toBeInTheDocument()
    expect(screen.getByText('stdio · npx')).toBeInTheDocument()
    expect(screen.getByText('1 connected')).toBeInTheDocument()
  })

  it('asks for the account-level profile, not an employee’s', async () => {
    wrap(<ConnectorsView />)
    await screen.findByText('notion')

    expect(fetchMcpServersMock).toHaveBeenCalledWith('current')
  })

  it('states what the control will do, and writes it', async () => {
    wrap(<ConnectorsView />)

    await userEvent.click(await screen.findByRole('button', { name: 'Connect linear' }))
    expect(setMcpServerEnabledMock).toHaveBeenCalledWith('linear', true, 'current')

    await userEvent.click(screen.getByRole('button', { name: 'Disconnect notion' }))
    expect(setMcpServerEnabledMock).toHaveBeenCalledWith('notion', false, 'current')
  })

  it('narrows the list to what the search matches, by name or by address', async () => {
    wrap(<ConnectorsView />)
    await screen.findByText('notion')

    const search = screen.getByRole('textbox', { name: 'Search connectors' })
    await userEvent.type(search, 'notion.com')

    expect(screen.getByText('notion')).toBeInTheDocument()
    expect(screen.queryByText('linear')).not.toBeInTheDocument()

    await userEvent.clear(search)
    await userEvent.type(search, 'nothing here')

    expect(screen.getByText('No connector matches “nothing here”.')).toBeInTheDocument()
  })

  it('says where servers are added when the install has none', async () => {
    fetchMcpServersMock.mockResolvedValue([])
    wrap(<ConnectorsView />)

    expect(await screen.findByText(/No MCP servers are configured/)).toBeInTheDocument()
    expect(screen.queryByText(/connected/)).not.toBeInTheDocument()
  })

  it('surfaces a failed read instead of an empty list', async () => {
    fetchMcpServersMock.mockRejectedValue(new Error('401 — session token missing'))
    wrap(<ConnectorsView />)

    expect(await screen.findByRole('alert')).toHaveTextContent('session token missing')
  })
})
