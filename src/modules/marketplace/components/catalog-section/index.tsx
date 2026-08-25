import type { FC, ReactNode } from 'react'

interface CatalogSectionProps {
  title: string
  subtitle: string
  children: ReactNode
}

export const CatalogSection: FC<CatalogSectionProps> = ({ title, subtitle, children }) => (
  <section aria-label={title} className="flex flex-col gap-5">
    <div className="flex flex-col gap-1">
      <h2 className="text-heading-sm font-medium text-[rgb(var(--color-ink-7))]">{title}</h2>
      <p className="text-label-sm text-[rgb(var(--color-ink-7)/0.5)]">{subtitle}</p>
    </div>
    {children}
  </section>
)
