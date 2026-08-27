import type { FC, ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  /** Sits opposite the label — a count, or the section's one action. */
  action?: ReactNode
}

/** The small uppercase heading each block of the modal opens with. */
export const SectionLabel: FC<SectionLabelProps> = ({ children, action }) => (
  <div className="flex h-6 items-center justify-between gap-2">
    {/* No `tracking-*`: the type scale carries size, leading and tracking together, and
        adding one here would silently drop the other two. */}
    <h3 className="text-label-xs text-tertiary uppercase">{children}</h3>
    {action}
  </div>
)
