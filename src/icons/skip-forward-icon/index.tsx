import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SkipForwardIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path d="M5 3l6 5-6 5V3z" fill="currentColor" />
  </svg>
);
