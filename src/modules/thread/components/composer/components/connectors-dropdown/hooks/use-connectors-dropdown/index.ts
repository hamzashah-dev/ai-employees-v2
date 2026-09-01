import { useState } from 'react'
import {
  useMcpServers,
  type UseMcpServersResult,
} from '@/modules/core/hooks/use-mcp-servers'

export interface UseConnectorsDropdownResult extends UseMcpServersResult {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

/**
 * The dropdown's own open state over the shared connector list.
 *
 * The list itself is `modules/core/hooks/use-mcp-servers`, shared with the integrations
 * dialog behind this control, Settings › Connectors and the sidebar's count; only the
 * trigger's open/closed flag is local to this surface, and it stays here so the dropdown
 * keeps one hook rather than two.
 */
export function useConnectorsDropdown(profile: string): UseConnectorsDropdownResult {
  const [isOpen, setIsOpen] = useState(false)
  return { isOpen, setIsOpen, ...useMcpServers(profile) }
}
