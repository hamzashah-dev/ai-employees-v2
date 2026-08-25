import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LineHeightIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M8.48077 13.9091H15.75M8.48077 4.09091H15.75M8.48077 9H15.75M2.25 5.18182L4.32692 3M4.32692 3L6.40385 5.18182M4.32692 3V15M2.25 12.8182L4.32692 15M4.32692 15L6.40385 12.8182"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
