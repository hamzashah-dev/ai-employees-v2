import { useId, type FC, type ReactNode } from 'react'
import { cn } from '@repo/ui/cn'

interface DashboardSectionProps {
  title: string
  /** The section's own gap — 10px everywhere except Finished today's 6px. */
  className?: string
  children: ReactNode
}

/** A labelled stack. The label is the canvas's 16/20 w500 section heading. */
export const DashboardSection: FC<DashboardSectionProps> = ({
  title,
  className,
  children,
}) => {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={cn('flex flex-col', className)}>
      <h2 id={headingId} className="text-label-lg font-medium text-primary">
        {title}
      </h2>
      {children}
    </section>
  )
}
