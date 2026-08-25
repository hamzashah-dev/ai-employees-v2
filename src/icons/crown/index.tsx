import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CrownIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      d="M15 5.85 11.835 9 9 3.75 6.165 9 3 5.85l.857 6.825c0 .418.167.818.464 1.114.296.295.699.461 1.119.461h7.12c.42 0 .823-.166 1.12-.461.296-.296.463-.696.463-1.114L15 5.85Z"
    />
  </svg>
);
