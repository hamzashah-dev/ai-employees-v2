import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StopIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M4.66699 2.5H11.333C12.5296 2.5 13.5 3.47038 13.5 4.66699V11.333C13.5 12.5296 12.5296 13.5 11.333 13.5H4.66699C3.47038 13.5 2.5 12.5296 2.5 11.333V4.66699L2.51074 4.44531C2.61421 3.42542 3.42542 2.61421 4.44531 2.51074L4.66699 2.5Z"
      fill="currentColor"
      stroke="currentColor"
    />
  </svg>
);
