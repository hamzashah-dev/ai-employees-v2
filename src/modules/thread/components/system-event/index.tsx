import type { FC } from 'react'

interface SystemEventProps {
  text: string
}

/** Thread housekeeping — renames, archives. Centred, quiet, never a bubble. */
export const SystemEvent: FC<SystemEventProps> = ({ text }) => (
  <p className="text-center text-label-sm text-tertiary">{text}</p>
)
