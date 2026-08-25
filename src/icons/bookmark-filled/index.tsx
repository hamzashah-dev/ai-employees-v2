import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BookmarkFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    className={className}
  >
    <path
      d="m19.332 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
