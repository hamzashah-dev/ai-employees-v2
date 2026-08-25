import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const EyeIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M3.056 12.312a.9.9 0 0 1 0-.626 9.674 9.674 0 0 1 17.888 0 .9.9 0 0 1 0 .626 9.675 9.675 0 0 1-17.888 0"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M12 14.699a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4"
    />
  </svg>
);
