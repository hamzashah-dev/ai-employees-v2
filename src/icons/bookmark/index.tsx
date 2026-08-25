import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BookmarkIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    className={className}
  >
    <path
      d="m19.333 21.813-7-4-7 4v-16a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
