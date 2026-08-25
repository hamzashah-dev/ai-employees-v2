import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AlertTriangleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="18"
    fill="none"
    viewBox="0 0 20 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M9.764 10.017V7.043m-.002 5.981v-.048m6.994 3.774H2.748c-1.534 0-2.493-1.64-1.726-2.952L8.07 1.735c.77-1.317 2.695-1.312 3.458.009l6.96 12.063c.757 1.312-.203 2.943-1.732 2.943Z"
    />
  </svg>
);
