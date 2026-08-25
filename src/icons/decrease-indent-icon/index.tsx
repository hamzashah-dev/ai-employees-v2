import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DecreaseIndentIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M4.886 6.222 3.11 7.999l1.777 1.778m8.445-7.111H2.664m10.667 2.667H7.109m6.222 2.666H7.108m6.223 5.334H2.664m10.667-2.667H7.109"
      />
    </svg>
  );
};
