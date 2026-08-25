import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIPodcastOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="18" height="18" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M9 13.673v2.077m0-2.077c-3.107 0-5.625-2.557-5.625-5.711M9 13.673c3.107 0 5.625-2.557 5.625-5.711m-2.556 0V5.365c0-1.72-1.374-3.115-3.069-3.115S5.932 3.645 5.932 5.365v2.597c0 1.72 1.374 3.115 3.068 3.115 1.695 0 3.069-1.395 3.069-3.115"
    />
  </svg>
);
