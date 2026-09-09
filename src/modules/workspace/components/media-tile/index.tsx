import type { FC } from 'react'
import { CheckIcon } from '@repo/icons/check'
import { cn } from '@repo/ui/cn'
import { describeFileKind } from '@/modules/core/components/workspace/utils/file-kind'
import { managedFileUrl } from '@/modules/core/services/hermes/rest'
import type { WorkspaceGalleryItem } from '../../types'

interface MediaTileProps {
  item: WorkspaceGalleryItem
  selected: boolean
  onToggle: () => void
}

/**
 * One grid cell. Images get a real thumbnail off `/api/files/download` —
 * the same URL the file viewer streams from — everything else gets its
 * kind glyph, because Hermes has no thumbnail endpoint to ask for one.
 */
export const MediaTile: FC<MediaTileProps> = ({ item, selected, onToggle }) => {
  const { kind, icon: KindIcon } = describeFileKind(item.name)
  const isImage = kind === 'image'

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={item.name}
      onClick={onToggle}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-transparent bg-fill-elevated text-left transition-colors duration-200 ease-linear',
        { 'border-primary': selected },
      )}
    >
      <span
        className={cn(
          'absolute top-2 left-2 flex size-5 items-center justify-center rounded-full border border-secondary bg-surface',
          { 'border-transparent bg-fill-inverse': selected },
        )}
      >
        {selected && <CheckIcon className="size-3 text-inverse" />}
      </span>

      <span className="flex aspect-square w-full items-center justify-center bg-fill">
        {isImage ? (
          <img src={managedFileUrl(item.path)} alt="" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-8 text-tertiary" />
        )}
      </span>

      <span className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="truncate text-label-sm text-primary">{item.name}</span>
      </span>
    </button>
  )
}
