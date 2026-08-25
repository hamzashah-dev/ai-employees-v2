import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BoldIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M4.664 7.538V2h3.451c1.43 0 2.588 1.24 2.588 2.77 0 1.529-1.159 2.768-2.588 2.768h-3.45Zm0 0V14h4.314c1.668 0 3.02-1.447 3.02-3.23 0-1.785-1.352-3.232-3.02-3.232H4.664Z"
      />
    </svg>
  );
};
