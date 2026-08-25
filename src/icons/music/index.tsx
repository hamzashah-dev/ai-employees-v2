import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MusicIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M17.502 12.264V3.082a.6.6 0 0 0-.227-.462.57.57 0 0 0-.5-.1l-9.23 2.6a.58.58 0 0 0-.308.208.6.6 0 0 0-.12.354v9.51m0-6.346 10.385-2.884M4.808 17.5a2.308 2.308 0 1 0 0-4.616 2.308 2.308 0 0 0 0 4.616Zm10.384-2.884a2.308 2.308 0 1 0 0-4.616 2.308 2.308 0 0 0 0 4.616Z"
    />
  </svg>
);
