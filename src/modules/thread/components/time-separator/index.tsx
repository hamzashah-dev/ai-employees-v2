import type { FC } from 'react'
import { formatThreadTime } from '@/modules/core/utils/time'

interface TimeSeparatorProps {
  at: number
}

export const TimeSeparator: FC<TimeSeparatorProps> = ({ at }) => (
  <div className="flex justify-center">
    <time dateTime={new Date(at).toISOString()} className="text-label-sm text-tertiary">
      {formatThreadTime(at)}
    </time>
  </div>
)
