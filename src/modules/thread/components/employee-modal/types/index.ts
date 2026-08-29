import type { FC } from 'react'

/** The four pages of the employee card. The rail's order is this array's order. */
export type EmployeeModalPage = 'info' | 'files' | 'connectors' | 'vaults'

export interface ModalPageDef {
  id: EmployeeModalPage
  label: string
  icon: FC<{ className?: string }>
}
