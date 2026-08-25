import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const DiamondIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="m9.999 11.638-2-2.243M6 4.5h12l3 5.099-8.5 9.687a.7.7 0 0 1-.5.214.688.688 0 0 1-.5-.214L3 9.599 6 4.5Z"
    />
  </svg>
);
