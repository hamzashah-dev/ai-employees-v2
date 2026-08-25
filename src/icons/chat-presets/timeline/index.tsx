import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TimelinePresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#CC5281"
      d="M15.5 6a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm4.55 15.067a.875.875 0 0 1-1.242.053l-4.376-3.973a.877.877 0 0 1-.245-.647v-4.813a.875.875 0 1 1 1.75 0v4.428l4.052 3.719a.875.875 0 0 1 .061 1.233Z"
    />
  </svg>
);
