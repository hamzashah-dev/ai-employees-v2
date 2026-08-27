import { useState } from 'react'
import {
  useConnectors,
  type UseConnectorsResult,
} from '@/modules/thread/hooks/use-connectors'

export interface UseConnectorsDropdownResult extends UseConnectorsResult {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

/**
 * The dropdown's own open state over the shared connector list.
 *
 * The list itself moved to `modules/thread/hooks/use-connectors` when the employee info
 * modal started reading it too; only the trigger's open/closed flag is local to this
 * surface, and it stays here so the dropdown keeps one hook rather than two.
 */
export function useConnectorsDropdown(profile: string): UseConnectorsDropdownResult {
  const [isOpen, setIsOpen] = useState(false)
  return { isOpen, setIsOpen, ...useConnectors(profile) }
}
