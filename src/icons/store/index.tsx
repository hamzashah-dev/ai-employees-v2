import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StoreIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      className={className}
    >
      <path
        d="M4.538 7.167a2.538 2.538 0 1 0 0-5.077 2.538 2.538 0 0 0 0 5.077ZM11.461 7.167a2.538 2.538 0 1 0 0-5.077 2.538 2.538 0 0 0 0 5.077ZM4.538 14.09a2.538 2.538 0 1 0 0-5.077 2.538 2.538 0 0 0 0 5.077ZM11.461 14.09a2.538 2.538 0 1 0 0-5.077 2.538 2.538 0 0 0 0 5.077Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
