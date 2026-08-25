import type { FC } from 'react'
import { formatThreadTime } from '@/modules/core/utils/time'

interface TimeSeparatorProps {
  at: number
}

export const TimeSeparator: FC<TimeSeparatorProps> = ({ at }) => (
  <div className="flex justify-center">
    <time
      dateTime={new Date(at).toISOString()}
      className="text-label-sm text-[rgb(var(--color-ink-7)/0.5)]"
    >
      {formatThreadTime(at)}
    </time>
  </div>
)
