import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const SwitchLanguagesIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M16.154 5 21 9.9H3M7.846 19 3 14.1h18"
    />
  </svg>
);
