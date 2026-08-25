import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TrendChartIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M2 14v-3m4 3V8m4 6V5m4 9V2"
    />
  </svg>
);
