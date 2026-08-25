import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CheckCircleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M16.039 8.885 10.5 15.808 7.731 13.73M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18"
    />
  </svg>
);
