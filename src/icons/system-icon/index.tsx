import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SystemIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
      className={className}
    >
      <path
        strokeWidth="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.313 12.75 6.75 15l-.75.75h6l-.75-.75-.563-2.25m-8.437-3h13.5m-12 3h10.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5Z"
      />
    </svg>
  );
};
