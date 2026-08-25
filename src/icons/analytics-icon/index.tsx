import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AnalyticsIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="currentOpacity"
        strokeWidth="currentStroke"
        d="M2 14V2h4v12-7h4v7-9.5h4V14"
      />
    </svg>
  );
};
