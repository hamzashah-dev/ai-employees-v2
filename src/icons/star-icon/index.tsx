import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StarIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M2.185 7.526c-.58-.102-.58-.95 0-1.052 2.104-.372 3.776-2.001 4.233-4.122l.035-.162c.125-.584.942-.588 1.073-.005l.042.19c.474 2.11 2.147 3.725 4.244 4.096.584.103.584.955 0 1.058-2.097.371-3.77 1.986-4.244 4.097l-.042.19c-.13.582-.948.578-1.073-.006l-.035-.162c-.457-2.12-2.13-3.75-4.233-4.122Z"
      />
    </svg>
  );
};
