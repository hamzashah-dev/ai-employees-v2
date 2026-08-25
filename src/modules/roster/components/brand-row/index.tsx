import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { CollapseIcon, LogoMarkIcon } from '@/modules/core/components/icon'

/**
 * The sidebar header, matching chatly's: logo mark and wordmark on the left,
 * with the collapse control appearing only on hover so the resting state stays
 * clean.
 */
export const BrandRow: FC<{ onToggle?: () => void }> = ({ onToggle }) => (
  <div className="group/header flex h-12 items-center justify-between px-3">
    <Link to="/" className="flex items-center gap-2">
      <LogoMarkIcon className="size-5 text-[rgb(var(--color-content-primary))]" />
      <span className="text-label-lg font-medium text-[rgb(var(--color-content-primary))]">
        Imagine
      </span>
    </Link>

    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={onToggle}
      className="flex size-7 items-center justify-center rounded-xl text-[rgb(var(--color-content-primary)/0.5)] opacity-0 transition-opacity duration-200 group-hover/header:opacity-100 hover:bg-[rgb(var(--color-fill-secondary))] hover:text-[rgb(var(--color-content-primary))] focus-visible:opacity-100"
    >
      <CollapseIcon className="size-4 stroke-[1.2px]" />
    </button>
  </div>
)
