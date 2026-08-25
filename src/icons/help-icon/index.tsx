import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const HelpIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M9 5.957s1.667-2.513 5.002-2.95c.547-.071.998.386.998.94v7.034c0 .555-.45.997-.998 1.07C10.667 12.486 9 15 9 15m0-9.043V15m0-9.043s-1.667-2.513-5.002-2.95c-.547-.071-.998.386-.998.94v7.034c0 .555.45.997.998 1.07C7.333 12.486 9 15 9 15"
    />
  </svg>
);
