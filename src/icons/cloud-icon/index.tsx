import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CloudIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="15"
      height="12"
      fill="none"
      viewBox="0 0 15 12"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="currentStroke"
        d="M4.29 6.65a2.646 2.646 0 0 0-1.164-.267c-3.168.215-3.168 4.652 0 4.867h7.506a3.679 3.679 0 0 0 2.464-.912c2.226-1.87 1.035-5.63-1.896-5.988C10.145-1.755.987.565 3.16 6.383"
      />
    </svg>
  );
};
